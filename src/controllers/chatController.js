const axios = require('axios');

// Controller gửi câu hỏi tới server RAG và trả về kết quả cho FE
// req.body: { messages: Array, cityId: String, isUseKnowledge: Boolean, model: String (optional) }
const createChatCompletion = async (req, res) => {
    try {
        const { messages, cityId, isUseKnowledge, model } = req.body;
        if (!messages) {
            return res.status(400).json({ error: 'messages là bắt buộc' });
        }

        // Chuẩn bị payload, chỉ thêm cityId nếu có
        const payload = {
            messages,
            isUseKnowledge: isUseKnowledge !== undefined ? isUseKnowledge : true,
        };
        if (cityId) payload.cityId = cityId;
        if (model) payload.model = model;

        // Gửi request tới server RAG
        const response = await axios.post(process.env.RAG_SERVER_URL + '/v1/chat/completions', payload, {
            timeout: 20000, // 20s
        });
        return res.json(response.data);
    } catch (err) {
        if (err.response) {
            return res.status(err.response.status).json(err.response.data);
        }
        return res.status(500).json({ error: err.message });
    }
};

module.exports = {
    createChatCompletion,
};
