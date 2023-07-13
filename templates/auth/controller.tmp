/*************************/
/*** Import used modules */
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

/**********************************/
/*** Unit route for Auth resource */

exports.signup = async (req, res) => {
    const { email, password } = req.body

    // Check data from request
    if (!email || !password) {
        return res.status(400).json({ message: 'Missing Data' })
    }

    try{

        // Password Hash
        let hash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUND))
        req.body.password = hash


    }catch(err){
        console.log(err)
    }
}

exports.login = async (req, res) => {
    const { email, password } = req.body

    // Check data from request
    if(!email || !password){
        return res.status(400).json({ message: 'Bad credentials'})
    }

    try{
        // Password check  
        let test = await bcrypt.compare(password, 'HERE THE USER PASSWORD FROM BDD')
        if(!test){
            return res.status(401).json({ message: 'Wrong password'})
        }

        // JWT generation
        const token = jwt.sign({
            payload: 'YOUR PAYLOAD'
        }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_DURING})
        
        return res.json({access_token: token})
    }catch(err){
        console.log(err)
    }
}