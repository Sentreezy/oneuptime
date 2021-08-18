module.exports = {
    findBy: async function({ query, skip, limit, populate, select }) {
        try {
            if (!skip) skip = 0;

            if (!limit) limit = 0;

            if (typeof skip === 'string') skip = parseInt(skip);

            if (typeof limit === 'string') limit = parseInt(limit);

            if (!query) query = {};

            let auditLogsQuery = AuditLogsModel.find(query)
                .lean()
                .sort([['createdAt', -1]])
                .limit(limit)
                .skip(skip);

            auditLogsQuery = handleSelect(select, auditLogsQuery);
            auditLogsQuery = handlePopulate(populate, auditLogsQuery);

            const auditLogs = await auditLogsQuery;

            return auditLogs;
        } catch (error) {
            ErrorService.log('auditLogs.findBy', error);
            throw error;
        }
    },

    countBy: async function({ query }) {
        if (!query) {
            query = {};
        }

        const count = await AuditLogsModel.countDocuments(query);
        return count;
    },

    create: async function(data) {
        try {
            const auditLogsModel = new AuditLogsModel({
                userId: data.userId,
                projectId: data.projectId,
                request: data.request,
                response: data.response,
            });

            const auditLog = await auditLogsModel.save();
            return auditLog;
        } catch (error) {
            ErrorService.log('auditLogs.create', error);
            throw error;
        }
    },

    search: async function({ filter, skip, limit }) {
        const _this = this;
        const query = {
            'request.apiSection': { $regex: new RegExp(filter), $options: 'i' },
        };

        const populateAuditLog = [
            { path: 'userId', select: 'name' },
            { path: 'projectId', select: 'name' },
        ];

        const selectAuditLog = 'userId projectId request response createdAt';

        const [searchedAuditLogs, totalSearchCount] = await Promise.all([
            _this.findBy({
                query,
                skip,
                limit,
                populate: populateAuditLog,
                select: selectAuditLog,
            }),
            _this.countBy({ query }),
        ]);

        return { searchedAuditLogs, totalSearchCount };
    },

    hardDeleteBy: async function({ query }) {
        try {
            await AuditLogsModel.deleteMany(query);
        } catch (error) {
            ErrorService.log('auditLogs.hardDeleteBy', error);
            throw error;
        }
    },
};

const AuditLogsModel = require('../models/auditLogs');
const ErrorService = require('./errorService');
const handlePopulate = require('../utils/populate');
const handleSelect = require('../utils/select');
