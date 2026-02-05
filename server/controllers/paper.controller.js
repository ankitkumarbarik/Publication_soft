const Paper = require('../models/Paper');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const sendEmail = require('../utils/email');
const bcrypt = require('bcryptjs');
const fs = require('fs');

// Helper to Create Author if not exists
const findOrCreateAuthor = async (name, email) => {
  let user = await User.findOne({ email });
  let password = null;
  let isNew = false;

  if (!user) {
    isNew = true;
    password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8); // Secure random password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'author'
    });
    await user.save();
  }
  return { user, password, isNew };
};

exports.submitPaper = async (req, res) => {
  try {
    const { title, abstract, name, email } = req.body;
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    // 1. Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: 'auto',
        folder: 'research_papers'
    });

    // Cleanup local file
    fs.unlinkSync(req.file.path);

    // 2. Handle Author (Auto-create or Link)
    // If logged in (req.user exists), use that. Else use name/email from form.
    let authorId;
    if (req.user) {
        authorId = req.user.id;
    } else {
        if (!name || !email) return res.status(400).json({ message: 'Author details required' });
        const { user, password, isNew } = await findOrCreateAuthor(name, email);
        authorId = user._id;

        if (isNew) {
            // Send email with credentials
            await sendEmail(
                email,
                'Your Research Account Created',
                `Welcome! parsed... Password: ${password}`,
                `<p>Your account has been created. Password: <strong>${password}</strong></p>`
            );
        }
    }

    // 3. Create Paper
    const newPaper = new Paper({
        title,
        abstract,
        authorId,
        cloudinaryUrl: result.secure_url,
        cloudinaryPublicId: result.public_id,
        status: 'SUBMITTED'
    });

    await newPaper.save();
    res.status(201).json({ message: 'Paper submitted successfully', paper: newPaper });

  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.getAllPapers = async (req, res) => {
    try {
        const papers = await Paper.find().populate('authorId', 'name email').populate('reviewerId', 'name');
        res.json(papers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAssignedPapers = async (req, res) => {
    try {
        const papers = await Paper.find({ reviewerId: req.user.id });
        res.json(papers);
    } catch (error) {
         res.status(500).json({ error: error.message });
    }
};

exports.assignReviewer = async (req, res) => {
    try {
        const { paperId, reviewerId } = req.body;
        const paper = await Paper.findById(paperId);
        if (!paper) return res.status(404).json({ message: 'Paper not found' });

        paper.reviewerId = reviewerId;
        paper.status = 'UNDER_REVIEW';
        await paper.save();
        
        // Notify Reviewer
        const reviewer = await User.findById(reviewerId);
        if (reviewer) {
             await sendEmail(reviewer.email, 'New Paper Assigned', 'You have a new paper to review.', '<p>New paper assigned.</p>');
        }

        res.json({ message: 'Reviewer assigned' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.submitReview = async (req, res) => {
    try {
        const { paperId, remark, recommendation } = req.body;
        const paper = await Paper.findOne({ _id: paperId, reviewerId: req.user.id });
        
        if (!paper) return res.status(404).json({ message: 'Paper not found or not assigned to you' });

        paper.reviewRemark = remark;
        paper.reviewRecommendation = recommendation;
        // Status remains UNDER_REVIEW until Admin decides? Or Reviewer can say 'Reviewed'?
        // Requirement says: "Reviewer submits Remark + Recommendation".
        // Admin makes final decision.
        // Maybe update status to something else? Or keep UNDER_REVIEW. 
        // Let's keep distinct status if needed, but requirements imply Admin views feedback.
        
        await paper.save();
        res.json({ message: 'Review submitted' });
    } catch (error) {
         res.status(500).json({ error: error.message });
    }
};

exports.getMyPapers = async (req, res) => {
    try {
        const papers = await Paper.find({ authorId: req.user.id });
        res.json(papers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.finalDecision = async (req, res) => {
    try {
        const { paperId, decision } = req.body; // PUBLISH or REJECT
        const paper = await Paper.findById(paperId);
        if (!paper) return res.status(404).json({ message: 'Paper not found' });

        if (decision === 'PUBLISH') {
            paper.status = 'PUBLISHED';
        } else if (decision === 'REJECT') {
            paper.status = 'REJECTED';
        } else {
            return res.status(400).json({ message: 'Invalid decision' });
        }

        await paper.save();
        
        // Notify Author
        const author = await User.findById(paper.authorId);
        await sendEmail(author.email, `Paper ${decision}ED`, `Your paper ${paper.title} has been ${decision}ED.`, `<p>Your paper has been ${decision}ED.</p>`);

        res.json({ message: 'Decision recorded' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
