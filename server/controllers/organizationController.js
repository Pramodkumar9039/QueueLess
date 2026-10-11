const Organization = require('../models/Organization.js');

// Create a new Organization 
const createOrganization = async (req , res) => {
    try{
        const { name , type , address , description } = req.body;

        if(!name || !type || !address){
            return res.status(400).json({
                message: "Name, type and address are required",
            })
        }

        const organization = await Organization.create({
            name,
            type,
            address,
            description,
            owner: req.user.userId,
        });

        return res.status(201).json({
            message: "Organization created successfully",
            organization,
        });
    }
    catch(error){
        console.error("Create organization error:",error);

        return res.status(500).json({
            message: "Unable to create organization",
        })
    }
};

// Get all organizations 
const getOrganizations = async (req , res) => {
    try{
        const organizations = await Organization.find({
            isActive: true,
        }).sort({ createdAt: -1});

        return res.status(200).json({
            count: organizations.length,
            organizations,
        });
    }
    catch(error){
        console.error("Get organizations error: ",error);

        return res.status(500).json({
            message: "Unable to fetch organization",
        })
    }
}

module.exports = {
    createOrganization,
    getOrganizations,
}
