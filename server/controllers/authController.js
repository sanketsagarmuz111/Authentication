import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";
import {EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE} from "../config/emailTemplates.js"

const getEmailErrorMessage = (error) => {
  const providerMessage = `${error?.message || ""} ${error?.response || ""}`;

  if (
    error?.code === "EAUTH" ||
    error?.responseCode === 535 ||
    providerMessage.includes("535") ||
    providerMessage.toLowerCase().includes("invalid login")
  ) {
    return "Email service authentication failed. Please check SMTP_USER and SMTP_PASS in server/.env.";
  }

  return "Email could not be sent. Please try again later.";
};

const sendAppEmail = async (mailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    const message = getEmailErrorMessage(error);
    const mailError = new Error(message);
    mailError.cause = error;
    throw mailError;
  }
};

export const register = async (req, res) => {

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({ success: false, message: "Missing Details" });
  }
 
  try {
    const existingUser = await userModel.findOne({email})

    if(existingUser){
        return res.json({success:false,message:"User already exists"})
    }
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = new userModel({name, email, password:hashedPassword})
    await user.save()

    const token = jwt.sign({id:user._id}, process.env.JWT_SECRET, {expiresIn:'7d'})

    res.cookie('token',token ,{
        httpOnly:true,
        secure: process.env.NODE_ENV === 'production', 
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, 
    })

    // sending welcome email 
    const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: 'Welcome to Subharti',
        text: `Welcome to Sanket's Authentication demo web application.Your account is created with email id : ${email}`
    }

    try {
      await sendAppEmail(mailOptions);
    } catch (error) {
      console.error("Welcome email failed:", error.message);
    }

    return res.json({success:true, message:"Account created successfully"})

  } catch (error) {
    if (error?.code === 11000) {
      return res.json({ success: false, message: "User already exists" });
    }

    return res.json({ success: false, message: error.message });
  }
};

export const login = async(req,res)=>{
    const {email, password} = req.body;

    if(!email || !password){
        return res.json({success:false,message:"email and password is required"})
    }
    try {
        const user = await userModel.findOne({email});

        if(!user){
            return res.json({success:false,message:"Invalid Email"})
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.json({success:false,message:"Invalid Password"})
        }
        const token = jwt.sign({id:user._id}, process.env.JWT_SECRET, {expiresIn:'7d'})

        res.cookie('token',token ,{
            httpOnly:true,
            secure: process.env.NODE_ENV === 'production', 
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, 
        })

        return res.json({success:true})

    } catch (error) {
        return res.json({success:false,message:error.message})
    }
}

export const logout = async (req,res) => {
    try {
        res.clearCookie('token', {
            httpOnly:true,
            secure: process.env.NODE_ENV === 'production', 
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })

        return res.json({success:true,message:"Logged Out"})

    } catch (error) {
        return res.json({success:false,message:error.message})
    }
}

// send verification OTP to the User's Email
export const sendVerifyOtp = async(req,res)=>{
    try{
        const userId = req.userId || req.body.userId

        const user = await userModel.findById(userId)

        if(!user){
            return res.json({success:false,message:"User not found"})
        }

        if(user.isAccountVerified){
            return res.json({success:false,message:"Account Already verified"})
        }

        const otp = (Math.floor(100000 + Math.random()* 900000)).toString()
        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000

        const mailOption = { 
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account Verification OTP',
            // text: `Your OTP is ${otp}.Verify your account using this OTP.`,
            html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
        }

        await sendAppEmail(mailOption)
        await user.save()

        res.json({success:true,message:"Verification OTP sent on Email"})

    }catch(error){
        res.json({success:false,message:error.message})
    }
}

// Verify the email using OTP
export const verifyEmail = async (req,res)=>{
    const userId = req.userId || req.body.userId
    const {otp} = req.body

    if(!userId || !otp){
        return res.json({success:false,message:"Missing Details"});
    }
    try {
        const user = await userModel.findById(userId)

        if(!user){
            return res.json({success:false,message:"User not found"});
        }

        if(user.verifyOtp === '' || user.verifyOtp !== otp){
            return res.json({success:false,message:"Invalid OTP"});
        }

        if(user.verifyOtpExpireAt < Date.now()){
            return res.json({success:false,message:"OTP Expired"});
        }

        user.isAccountVerified = true;

        user.verifyOtp = ''
        user.verifyOtpExpireAt = 0

        await user.save()

        return res.json({success:true,message:"Email verified Succesfully"});
    } catch (error) {
        return res.json({success:false,message:error.message});
    }
}

// check if user is authenticated 
export const isAuthenticated = async(req,res)=>{
    try {
        return res.json({success:true})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

// send password reset OTP
export const sendResetOtp = async (req,res)=>{
    const {email} = req.body;

    if(!email){
        return res.json({success:false,message:"Email is required"})
    }

    try {
        const user = await userModel.findOne({email})
        if(!user){
            return res.json({success:false,message:"User not found"})
        }

        const otp = (Math.floor(100000 + Math.random()* 900000)).toString()
        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password Reset OTP',
            // text: `Your OTP for resetting your password is ${otp}.Use this OTP to proceed with resetting your password.`
            html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
        }
        await sendAppEmail(mailOption)

        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000
        await user.save()

        return res.json({success:true,message:"OTP sent to your email."})

    } catch (error) {
        return res.json({success:false,message:error.message})
    }
}

// Reset User Password
export const resetPassword = async(req,res)=>{
    const {email,otp,newPassword} = req.body;

    if(!email || !otp || !newPassword){
        return res.json({success:false,message:"Email, OTP, and new Password are required."})
    }

    try {
        const user = await userModel.findOne({email})
        if(!user){
            return res.json({success:false,message:"User not found"})
        }

        if(user.resetOtp === "" || user.resetOtp !== otp){
            return res.json({success:false,message:"Invalid OTP"})
        }

        if(user.resetOtpExpireAt < Date.now()){
            return res.json({success:false,message:"OTP Expired"})
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10 )

        user.password = hashedPassword ;
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;

        await user.save()

        return res.json({success:true,message:"Password has been reset successfully"})
    } catch (error) {
        return res.json({success:false,message:error.message})
    }
}
