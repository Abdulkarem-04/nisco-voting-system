// Import required packages
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { OAuth2Client } = require('google-auth-library');

// Initialize the Express application
const app = express();
const port = process.env.PORT || 5000;

// Middleware to allow cross-origin requests (Frontend talking to Backend) and parse JSON
app.use(cors());
app.use(express.json());

// Initialize Supabase and Google Auth clients using our .env variables
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ------------------------------------------------------------------
// ROUTE 1: Get Election Status & Candidates (Used by Frontend to load page)
// ------------------------------------------------------------------
app.get('/api/election-data', async (req, res) => {
    try {
        // Fetch the kill switch status
        const { data: settings } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', 'is_voting_enabled')
            .single();

        // Fetch all candidates
        const { data: candidates } = await supabase
            .from('candidates_tickets')
            .select('*')
            .order('id', { ascending: true });

        res.json({
            isVotingEnabled: settings ? settings.value : false,
            candidates: candidates || []
        });
    } catch (error) {
        console.error("Error fetching election data:", error);
        res.status(500).json({ error: 'Failed to fetch election data' });
    }
});

// // ------------------------------------------------------------------
// // ROUTE 2: Verify Voter Login
// // ------------------------------------------------------------------
// app.post('/api/verify-login', async (req, res) => {
//     const { credential } = req.body; // credential is the Google Login Token

//     try {
//         // 1. Verify the Google Token is real
//         const ticket = await googleClient.verifyIdToken({
//             idToken: credential,
//             audience: process.env.GOOGLE_CLIENT_ID,
//         });
//         const payload = ticket.getPayload();
//         const email = payload.email;

//         // 2. Enforce the @student.aiu.edu.my domain rule
//         if (!email.endsWith('@student.aiu.edu.my')) {
//             return res.status(403).json({ error: 'Access Denied: Please use your @student.aiu.edu.my email.' });
//         }

//         // 3. Check if the email is on the voters_list
//         const { data: voter, error: voterError } = await supabase
//             .from('voters_list')
//             .select('*')
//             .eq('email', email)
//             .single();

//         if (voterError || !voter) {
//             return res.status(403).json({ error: 'Access Denied: Email not found on the NISCO registered voters list.' });
//         }

//         // 4. Check if they have already voted
//         if (voter.has_voted) {
//             return res.status(403).json({ error: 'Access Denied: You have already submitted a ballot.' });
//         }

//         // If all checks pass, send back a success message
//         res.json({ success: true, email: email, message: 'Verification successful.' });

//     } catch (error) {
//         console.error("Login verification error:", error);
//         res.status(401).json({ error: 'Invalid Google Authentication Token.' });
//     }
// });

// ------------------------------------------------------------------
// ROUTE 2: Verify Voter Login
// ------------------------------------------------------------------
app.post('/api/verify-login', async (req, res) => {
    const { credential } = req.body; 

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const email = payload.email;

        if (!email.endsWith('@student.aiu.edu.my')) {
            return res.status(403).json({ error: 'Access Denied: Please use your @student.aiu.edu.my email.' });
        }

        const { data: voter, error: voterError } = await supabase
            .from('voters_list')
            .select('*')
            .eq('email', email)
            .single();

        if (voterError || !voter) {
            return res.status(403).json({ error: 'Access Denied: Email not found on the NISCO registered voters list.' });
        }

        // NEW LOGIC: Instead of an error, we send a success response but flag them as 'hasVoted'
        if (voter.has_voted) {
            return res.json({ 
                success: true, 
                email: email, 
                hasVoted: true, // The frontend will use this to redirect them
                message: 'User has already voted.' 
            });
        }

        // If they haven't voted, proceed normally
        res.json({ 
            success: true, 
            email: email, 
            hasVoted: false, 
            message: 'Verification successful.' 
        });

    } catch (error) {
        console.error("Login verification error:", error);
        res.status(401).json({ error: 'Invalid Google Authentication Token.' });
    }
});

// // ------------------------------------------------------------------
// // ROUTE 3: Submit the Vote
// // ------------------------------------------------------------------
// app.post('/api/submit-vote', async (req, res) => {
//     // We require the Google token again here to ensure security at the moment of voting
//     const { credential, selectedCandidateIds } = req.body; 

//     try {
//         // 1. Re-verify the user's identity
//         const ticket = await googleClient.verifyIdToken({
//             idToken: credential,
//             audience: process.env.GOOGLE_CLIENT_ID,
//         });
//         const email = ticket.getPayload().email;

//         // 2. Check the Kill Switch one last time (Prevents bypassing UI)
//         const { data: settings } = await supabase
//             .from('system_settings')
//             .select('value')
//             .eq('key', 'is_voting_enabled')
//             .single();

//         if (!settings || settings.value === false) {
//             return res.status(403).json({ error: 'Voting is currently closed.' });
//         }

//         // 3. Verify they haven't voted yet
//         const { data: voter } = await supabase
//             .from('voters_list')
//             .select('has_voted')
//             .eq('email', email)
//             .single();

//         if (!voter || voter.has_voted) {
//             return res.status(403).json({ error: 'You have already voted or are not registered.' });
//         }

//         // 4. TRANSACTION GUARD: First, mark the user as voted
//         const { error: updateError } = await supabase
//             .from('voters_list')
//             .update({ has_voted: true })
//             .eq('email', email);

//         if (updateError) throw new Error('Failed to update voter status');

//         // 5. Save the votes anonymously (Handling the "Skip" logic)
//         // selectedCandidateIds is an array of IDs. If they skipped a position, that ID just won't be in the array.
//         if (selectedCandidateIds && selectedCandidateIds.length > 0) {
            
//             // Format the array into Supabase insertion format
//             const voteInserts = selectedCandidateIds.map(id => ({ ticket_id: id }));
            
//             const { error: insertError } = await supabase
//                 .from('election_results')
//                 .insert(voteInserts);

//             // If saving votes fails, we must roll back the has_voted status to false
//             if (insertError) {
//                 await supabase.from('voters_list').update({ has_voted: false }).eq('email', email);
//                 throw new Error('Failed to save votes to the database.');
//             }
//         }

//         res.json({ success: true, message: 'Your ballot has been securely submitted!' });

//     } catch (error) {
//         console.error("Vote submission error:", error);
//         res.status(500).json({ error: 'A server error occurred while processing your vote.' });
//     }
// });

// ------------------------------------------------------------------
// ROUTE 3: Submit the Vote (SECURED WITH ATOMIC TRANSACTION GUARD)
// ------------------------------------------------------------------
app.post('/api/submit-vote', async (req, res) => {
    const { credential, selectedCandidateIds } = req.body; 

    try {
        // 1. Re-verify the user's identity
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const email = ticket.getPayload().email;

        // 2. Check the Kill Switch
        const { data: settings } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', 'is_voting_enabled')
            .single();

        if (!settings || settings.value === false) {
            return res.status(403).json({ error: 'Voting is currently closed.' });
        }

        // 3 & 4. ATOMIC TRANSACTION GUARD (The Fix)
        // We attempt to update has_voted to true, ONLY IF it is currently false.
        // If 100 requests hit this at the exact same millisecond, the database 
        // guarantees only the very first one will succeed.
        const { data: updatedVoter, error: updateError } = await supabase
            .from('voters_list')
            .update({ has_voted: true })
            .eq('email', email)
            .eq('has_voted', false) // Critical: Only update if false
            .select() // Return the updated row if successful
            .single();

        // If no row was returned, it means they already voted (or email doesn't exist)
        if (updateError || !updatedVoter) {
            return res.status(403).json({ error: 'Vote failed: You have already voted or are not registered.' });
        }

        // 5. Save the votes anonymously
        if (selectedCandidateIds && selectedCandidateIds.length > 0) {
            const voteInserts = selectedCandidateIds.map(id => ({ ticket_id: id }));
            
            const { error: insertError } = await supabase
                .from('election_results')
                .insert(voteInserts);

            if (insertError) {
                // Emergency rollback if saving the ballot fails
                await supabase.from('voters_list').update({ has_voted: false }).eq('email', email);
                throw new Error('Failed to save votes to the database.');
            }
        }

        res.json({ success: true, message: 'Your ballot has been securely submitted!' });

    } catch (error) {
        console.error("Vote submission error:", error);
        res.status(500).json({ error: 'A server error occurred while processing your vote.' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`NISCO Backend Server is running on http://localhost:${port}`);
});