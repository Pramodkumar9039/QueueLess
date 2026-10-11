const Service = require('../models/Service');
const Organization = require('../models/Organization')

// Create a new service 
const createService = async (req , res) => {
    try{
        const {
            name,
            description,
            estimatedDuration,
            organizationId,
        } = req.body;

        if(!name || !organizationId || estimatedDuration == null){
            return res.status(400).json({
                message: "Name, organization ID and estimated duration are required",
            });
        }

        if(!Number.isInteger(estimatedDuration) || estimatedDuration < 1){
            return res.status(400).json({
                message: "Estimated duration must be a positive whole number",
            });
        }

        const organization = await Organization.findById(organizationId);

        if(!organization || !organization.isActive){
            return res.status(404).json({
                message: "Active organization not found",
            });
        }

        //Only the organization owner can add services 
        if(organization.owner.toString() != req.user.userId){
            return res.status(403).json({
                message: "You are not allowed to manage this organization",
            })
        }

        const service = await Service.create({
            name,
            description,
            estimatedDuration,
            organization: organization._id,
        });

        return res.status(201).json({
            message: "Service created successfully",
            service,
        })
    }
    catch(error){
        console.error("Create service error: ",error);

        return res.status(500).json({
            message: "Unable to create service",
        })
    }
};

// Get active services for an organization 
const getServicesByOrganization = async (req , res) => {
    try{
        const {organizationId} = req.params;

        const organization = await Organization.findById(organizationId);

        if(!organization || !organization.isActive){
            return res.status(404).json({
                message: "Active organization not found",
            });
        }

        const services = await Service.find({
            organization: organization._id,
            isActive: true,
        }).sort({createdAt: -1});

        return res.status(200).json({
            count: services.length,
            services,
        })
    }
    catch(error){
        console.error("Get services error: ",error);

        return res.status(500).json({
            message: "Unable to fetch services"
        });
    }
}

module.exports = {
    createService,
    getServicesByOrganization,
}