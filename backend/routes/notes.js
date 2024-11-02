const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Notes = require('../models/Notes');
const { body, validationResult } = require('express-validator');


// route 1: Get all Notes login required
router.get('/fetchallnotes', fetchuser, async (req,res)=>{

    try {
        const notes = await Notes.find({user: req.user.id});
        res.json(notes)
    } catch (error) {
        console.error(error);
        res.status(500).json({ errors: [{ msg: 'Internal Server Error' }] });
    }
   
})

// route 2: Add a new Note post login required
router.post('/addnote', [
        body('title').isLength({ min: 3 }).withMessage('Title must be at least 3 characters long.'),
        body('description').isLength({ min: 5 }).withMessage('Description must be at least 5 characters long.'),
    ],
fetchuser, async (req,res)=>{

    const {title, description,tag, } = req.body;

    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const note = new Notes ({
            title, description, tag, user: req.user.id
        });
        const saveNote = await note.save();
        res.json(saveNote)

    } catch (error) {
        console.error(error);
        res.status(500).json({ errors: [{ msg: 'Internal Server Error' }] });
    }
});

// route 2: Add a new Note post login required
router.put('/updatenote/:id', [
    body('title').isLength({ min: 3 }).withMessage('Title must be at least 3 characters long.'),
    body('description').isLength({ min: 5 }).withMessage('Description must be at least 5 characters long.'),
],
    fetchuser, async (req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const {title, description,tag, } = req.body;

    const newNote = {};
    if(title){newNote.title = title};
    if(description){newNote.description = description};
    if(tag){newNote.tag = tag}

    //Find the note to be updated and update it
    let note = await Notes.findById(req.params.id);
    if(!note){return res.status(404).send("Not Found")}

    if(note.user.toString() != req.user.id){
        return res.status(401).send("Not Allowed");
    }

    note = await Notes.findByIdAndUpdate(req.params.id, {$set: newNote}, {new:true})
    res.json({note});
    

})

// route 3: Delete Note login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {
        // Find the note to be deleted
        let note = await Notes.findById(req.params.id);
        if (!note) {
            return res.status(404).send("Not Found");
        }

        // Allow deletion if the user owns this note
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }

        // Delete the note
        await Notes.findByIdAndDelete(req.params.id);
        res.json({ msg: "Your note has been deleted successfully." });

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});
module.exports = router
