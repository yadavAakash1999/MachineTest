const {
    nameValidation, stringValidation, emailValidation,
    passwordValidation, requestValidation, phoneNumberValidation } = require("../validation/validation.js");

const axios = require("axios")
const bcrypt = require("bcrypt")
const userModel = require("../models/userModel.js")
const friendRequestModel = require("../models/friendRequestModel.js")
const friendModel = require("../models/friendModel.js");
const conversationModel = require("../models/conversationModel.js")
const messageModel = require("../models/messageModel.js")
const jwt = require("jsonwebtoken")
const nodemailer = require("nodemailer")



const newUser = async( req, res)=>{
    try{
 const data = req.body
//  console.log(data);
 if(!requestValidation(data)){ return res.status(400).send({ status: false, message: "please enter the data in the body" });}
 
 const {first_name, last_name,email,phone,  password, cpassword, address } = data; 
 const {text, country, state, city} = address;


    if(!stringValidation(first_name)){ return res.status(400).send({ status : false, message:"please enter first name"}); }
    if(!nameValidation(first_name)){ return res.status(400).send({ status : false, message:"please enter valid name"});}


    if(!stringValidation(last_name)){ return res.status(400).send({ status : false, message:"please enter last name"}); }
    if(!nameValidation(last_name)){   return res.status(400).send({ status : false, message:"please enter valid name"});}

    
    if(!stringValidation(email)){ return res.status(400).send({ status : false, message:"please enter email"}); }
    if(!emailValidation(email)){ return res.status(400).send({ status : false, message:"please enter valid email"});}

    if(!stringValidation(phone)){ return res.status(400).send({ status : false, message:"please enter phone number"}); }
    if(!phoneNumberValidation(phone)){ return res.status(400).send({state : false, message : "please enter valid phone number"})}

    if (!stringValidation(password)) { return res.status(400).send({ status: false, message: "please enter the password" }) }
        if (password.length < 6) { return res.status(400).send({ status: false, message: "Password must contain atleast 6 characters" }) }
        if (!passwordValidation(password)) { return res.status(400).send({ status: false, message: "Please enter a valid password with atleast one uppercase, one lowercase and one special character." }) }

    if(!stringValidation(cpassword)) { return res.status(400).send({ status: false, message: "please enter the password" })}
        if(cpassword !== password) {return res.status(400).send({ status: false, message: "password did not match" })}

        if (!stringValidation(text)) { return res.status(400).send({ status: false, message: "please enter the address" }) }

        if (!stringValidation(country)) { return res.status(400).send({ status: false, message: "please enter the country" }) }

        if (!stringValidation(state)) { return res.status(400).send({ status: false, message: "please enter the state" }) }

        if (!stringValidation(city)) { return res.status(400).send({ status: false, message: "please enter the city" }) }

        let coordnates = await axios.get(`https://geocode.maps.co/search?city=${city}&state=${state}&country=${country}`)
        if (coordnates.length == 0) { return res.status(400).send({ status: false, message: " city, state or country name did not found" }) }

        const salt = await bcrypt.genSalt(10);
        const hashedpassword = await bcrypt.hash(password, salt);
        data.password = hashedpassword

        let isDuplicateEmail = await userModel.findOne({ email: data.email })
        if (isDuplicateEmail) { return res.status(400).send({ status: false, message: "This email is already exists" }) }

        let isDuplicatePhone = await userModel.findOne({ phone: data.phone })
        if (isDuplicatePhone) { return res.status(400).send({ status: false, message: "This phone number is already exists" }) }

        let obj = {
            first_name: first_name,
            last_name: last_name,
            phone: phone,
            email: email.toLowerCase(),
            password: data.password,
            address: {
                text: address,
                city: city,
                state: state,
                country: country,

            },
            location: {
                coordinates: [coordnates.data[0].lon, coordnates.data[0].lat]
            }
        }
        let createdData = await userModel.create(obj)
        res.status(201).send({ status: true, message: "user registered successfully", data: createdData })
    }catch(err){
    console.log(err)
    return res.status(500).send({ status: false, message: err.message })
    }
}

const login = async function (req, res) {
    try {
        let email = req.body.email.toLowerCase()
        let password = req.body.password

        if (!stringValidation(email)) { return res.status(400).send({ status: false, message: "email or phone is required" }) }
        if (!emailValidation(email) && !phoneNumberValidation(email)) { return res.status(400).send({ status: false, message: "please enter a valid email or phone" }) }

        if (!stringValidation(password)) { return res.status(400).send({ status: false, message: "password is required" }) }

        let user = await userModel.findOne({ $or: [{ email: email }, { phone: email }] });
        if (!user) return res.status(401).send({ status: false, message: "Invalid Crendentials", });

        const passwordDetails = await bcrypt.compare(password, user.password)
        if (!passwordDetails) return res.status(401).send({ status: false, message: "Invalid Credentials" })

        let token = jwt.sign(
            {
                _id: user._id.toString(),
                iat: new Date().getTime(),
            },
            "secrete-key",
        );

        res.cookie("jwtoken", token, {
            expires: new Date(Date.now() + 600000),
        });


        res.status(200).send({ userId: user._id, userName: user.first_name, token: token });
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message })
    }
}

const logout = async function (req, res) {
    try {
        res.clearCookie("jwtoken", { path: "/" });
        res.status(201).send({ status: true, message: "user logout successfully" })
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ status: false, message: err.message })
    }
}

const fetchUserData = async function (req, res) {
    try {
        res.status(200).send({ status: true, message: "user data", data: req.userData })
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ status: false, message: err.message })
    }
}

const rejectReq = async function (req, res) {
    try {
        const userData = req.userData;
        const id = req.params.id;

        const data = await friendRequestModel.deleteOne({$and : [{reciever : userData._id},{sender : id}]})
       
        res.status(200).send({ status: true, message: "request rejected", data: data });

    } catch (err) {
        console.log(err)
        res.status(500).send({ status: false, message: err.message })
    }
}


const acceptReq = async function (req, res) {
    try {
        const userData = req.userData;
        const id = req.params.id;

        const data1 = await friendModel.create({
            userId : userData._id,
            friendId : id
        })

        const data2 = await friendModel.create({
            userId : id,
            friendId : userData._id
        })

        const delete_req = await friendRequestModel.deleteOne({$and : [{reciever : userData._id},{sender : id}]});


         res.status(200).send({ status: true, message: "request accepted", data : delete_req });

    } catch (err) {
        console.log(err)
        res.status(500).send({ status: false, message: err.message })
    }
}

const sendRequest = async function (req, res) {
    try {
        const userData = req.userData;
        const id = req.params.id;

        const check = await friendRequestModel.findOne({ $or :[{$and : [{sender : userData._id},{reciever: id}]},{$and : [{reciever : userData._id},{sender: id}]}]});
        if(check) return res.status(400).send({status : false, message: "You have already sent or recieved request from this user "});

        const findDoc = await userModel.findById(id)
        if (!findDoc) return res.status(400).send({ status: false, message: "something went wrong" });

        const data = await friendRequestModel.create({
            sender : userData._id,
            reciever : id 
        })
        
        res.status(200).send({ status: true, message: "request sended" });
    } catch (err) {
        console.log(err)
        res.status(500).send({ status: false, message: err.message })
    }
}


const searchFiends = async function (req, res) {
    try {
        const maxDist = req.params.value
        const userData = req.userData;
        const longitude = userData.location.coordinates[0];
        const latitude = userData.location.coordinates[1];
        
        const data = await userModel.aggregate([
            {
                $geoNear: {
                    near: { type: "Point", coordinates: [longitude, latitude] },
                    key: "location",
                    maxDistance: parseFloat(maxDist) * 1000,
                    distanceField: "dist.calculated",
                    sherical: true
                }
            }
        ])
      //  console.log(userData,data);

        const friendList =  await friendModel.find({userId : userData._id}).populate(["friendId"])
        // console.log(friendList)
        const finalData = data.filter((data)=>userData._id.toString()!==data._id.toString())
                .filter((data)=>
                {
                    let cond = true;
                    for(let i=0; i<friendList.length; i++){
                        if(data._id.toString()=== friendList[i].friendId._id.toString()) {
                            cond = false;
                            break;
                        }
                    }
                    return cond;
                })

        res.status(200).send({ status: true, message: "data collected", data: finalData })
    } catch (err) {
        console.log(err)
        res.status(500).send({ status: false, message: err.message })
    }
}

const updateUser = async function (req, res) {
    try {
        const userData = req.userData
        const { first_name, last_name, email, phone, address } = req.body
        const { text, state, city, country } = address

        if (first_name) {
            if (!stringValidation(first_name)) { return res.status(400).send({ status: false, message: "please enter first name" }) }
            if (!nameValidation(first_name)) { return res.status(400).send({ status: false, message: "enter valid first name" }) }
            userData.first_name = first_name
        }

        if (last_name) {
            if (!stringValidation(last_name)) { return res.status(400).send({ status: false, message: "please enter first name" }) }
            if (!nameValidation(last_name)) { return res.status(400).send({ status: false, message: "enter valid first name" }) }
            userData.last_name = last_name
        }

        if (email) {
            if (!stringValidation(email)) { return res.status(400).send({ status: false, message: "please enter email" }) }
            if (!emailValidation(email)) { return res.status(400).send({ status: false, message: "enter valid email" }) }
            let uniqueEmail = await userModel.find({ $and: [{ _id: { $ne: userData._id } }, { email: email }] })
            if (uniqueEmail.length) { return res.status(400).send({ status: false, message: "This email is already registered" }) }
            userData.email = email
        }

        if (phone) {
            if (!stringValidation(phone)) { return res.status(400).send({ status: false, message: "please enter phone number" }) }
            if (!phoneNumberValidation(phone)) { return res.status(400).send({ status: false, message: "enter valid phone number" }) }
            let uniquephone = await userModel.find({ $and: [{ _id: { $ne: userData._id } }, { phone: phone }] })
            if (uniquephone.length) { return res.status(400).send({ status: false, message: "This phone number is already registered" }) }
            userData.phone = phone
        }

        if (address) {
            if (!state || !country || !city || !text) return res.status(400).send({ status: false, message: "enter all the fields of address" })
            let coordnates = await axios.get(`https://geocode.maps.co/search?city=${city}&state=${state}&country=${country}`)
            if (coordnates.length == 0) { return res.status(400).send({ status: false, message: "please enter valid city, state or country" }) }
            userData.address = address;
            userData.location.coordinates[0] = coordnates.data[0].lon;
            userData.location.coordinates[1] = coordnates.data[0].lat;

        }
        const finalData = await userData.save()
        res.status(200).send({ status: true, message: "user updated", data: finalData })
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ status: false, message: err.message })
    }
}

const deleteFriend = async function (req, res) {
    try {
        const userData = req.userData;
        const id = req.params.id

        const data1 = await friendModel.deleteOne({$and : [{userId : userData._id},{friendId : id}]});
        const data2 = await friendModel.deleteOne({$and : [{userId : id},{friendId : userData._id}]});


        res.status(200).send({ status: true, message: "deleted" });

    } catch (err) {
        console.log(err)
        res.status(500).send({ status: false, message: err.message })
    }
}

const friendsDetails = async function (req, res) {
    try {
        const id = req.params.id;

        const data = await userModel.findOne({ _id: id })
        if (!data) return res.status(400).send({ status: false, message: "Something went wrong" })

        res.status(200).send({ status: true, message: "friend profile", data: data })

    } catch (err) {
        console.log(err)
        res.status(500).send({ status: false, message: err.message })
    }
}

const forgotPasswordOtp = async function (req, res) {
    try {
        const { cred } = req.body

        let userData = await userModel.findOne({ $or: [{ email: cred }, { phone: cred }] })
        if (!userData) return res.status(400).send({ status: false, message: "Invalid Credentials" })

        generateOtp = function (size) {
            const zeros = '0'.repeat(size - 1);
            const x = parseFloat('1' + zeros);
            const y = parseFloat('9' + zeros);
            const confirmationCode = String(Math.floor(x + Math.random() * y));
            return confirmationCode;
        }

        let otp = generateOtp(4)

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "yadava8068@gmail.com",
                pass: "ikcsiyitqhitjvtm"
            }
        });

        const mailOptions = {
            from: "yadava8068@gmail.com",
            to: userData.email,
            subject: "Otp Verification Code",
            html: `<h1>This is the verification code for your password reset ${otp}. This Otp will expired in 3 minutes</h1>`
        }

        transporter.sendMail(mailOptions, async (error, info) => {
            if (error) {
                console.log("Error", error);
                res.status(500).send({ status: true, message: "Something went wrong" });
            } else {
                console.log("Email sent" + info.response);
                userData.otp = otp;
                let sav = await userData.save()

                let token = jwt.sign(
                    {
                        _id: userData._id.toString(),
                        iat: new Date().getTime(),
                    },
                    "secrete-key",
                );

                res.cookie("resetToken", token, {
                    expires: new Date(Date.now() + 180000),
                });
                res.status(200).send({ status: true, message: "Otp has sent successfully" });
            }
        })

    } catch (err) {
        console.log(err)
        res.status(500).send({ status: false, message: err.message })
    }
}

const otpAuth = async function (req, res) {
    try {

        let { otp } = req.body

        let token = req.cookies.resetToken;
        if (!token) return res.status(403).send({ status: false, message: "Otp has Expired" });

        let verifyToken;

        try {
            verifyToken = jwt.verify(token, "secrete-key");
        } catch (error) {
            return res.status(401).send({ status: false, message: error.message });
        }

        let user = await userModel.findOne({ _id: verifyToken._id });
        if (!user) return res.status(400).send({ status: false, message: "user not found" });

        if (otp != user.otp) return res.status(400).send({ status: false, message: "wrong Otp" });

        let token2 = jwt.sign(
            {
                otp: otp,
                _id: user._id.toString(),
                iat: new Date().getTime(),
            },
            "secrete-key",
        );

        res.cookie("resetToken", token2, {
            expires: new Date(Date.now() + 300000),
        });


        res.status(200).send({ status: true, message: "otp matched" })

    } catch (err) {
        console.log(err)
        res.status(500).send({ status: false, message: err.message })
    }
}

const resetPassword = async function (req, res) {
    try {

        const { password, cpassword } = req.body;

        const token = req.cookies.resetToken;
        if (!token) return res.status(403).send({ status: false, message: "please try again" });

        let verifyToken;

        try {
            verifyToken = jwt.verify(token, "secrete-key");
        } catch (error) {
            return res.status(401).send({ status: false, message: error.message });
        }

        let user = await userModel.findOne({ _id: verifyToken._id });
        if (!user) return res.status(400).send({ status: false, message: "user not found" });

        if (verifyToken.otp != user.otp) return res.status(400).send({ status: false, message: "Something went wrong" });

        if (!stringValidation(password)) { return res.status(400).send({ status: false, message: "please enter the password" }) }
        if (!passwordValidation(password)) { return res.status(400).send({ status: false, message: "Please enter a valid password with atleast one uppercase one lowercase  one special character and must contain atleast 6 characters" }) }
        if (!stringValidation(cpassword)) { return res.status(400).send({ status: false, message: "please enter the password" }) }
        if (cpassword != password) return res.status(400).send({ status: false, message: "password is not matching" })

        const salt = await bcrypt.genSalt(10);
        const encryptedPassword = await bcrypt.hash(password, salt);
        user.password = encryptedPassword
        user.otp = ""
        let finl = await user.save()
        res.clearCookie("jwtoken", { path: "/" });
        res.status(200).send({ status: true, message: "password change successfully" })

    } catch (err) {
        console.log(err)
        res.status(500).send({ status: false, message: err.message })
    }
}

//new conv

const createNewConversation = async (req, res) => {
    // console.log(req.body, req.userData)
    const newConversation = new conversationModel({
      members: [req.userData._id.toString(), req.body.receiverId],
    });
  
    try {
      const savedConversation = await newConversation.save();
      res.status(200).json({ status: true, data: savedConversation});
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  };
  
  //get conv of a user
  
  const getConversation = async (req, res) => {
    try {
      const conversation = await conversationModel.find({
        members: { $in: [req.params.userId] },
      });
      res.status(200).json({ status: true, data: conversation});
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  }

  const createMassage = async (req, res) => {
    const newMessage = new messageModel(req.body);
  
    try {
      const savedMessage = await newMessage.save();
      res.status(200).json({ status: true, data: savedMessage});
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  }
  
  //get
  
  const getMassages = async (req, res) => {
    try {
      const messages = await messageModel.find({
        conversationId: req.params.conversationId,
      });
      res.status(200).json({status : true, data :messages});
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  }

  

module.exports = {
    newUser, login, logout, fetchUserData, friendsDetails,
    rejectReq, searchFiends, acceptReq,  sendRequest, updateUser, deleteFriend,
    forgotPasswordOtp, otpAuth, resetPassword , createNewConversation, getConversation
    ,createMassage , getMassages
}