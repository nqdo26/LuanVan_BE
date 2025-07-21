// API lấy chi tiết 1 cuộc trò chuyện theo id (GET /api/chats/:id)
const getChatById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ error: 'Thiếu id cuộc trò chuyện' });
        const chat = await Chat.findById(id);
        if (!chat) return res.status(404).json({ error: 'Không tìm thấy cuộc trò chuyện' });
        return res.status(200).json({ data: chat });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
// API lấy lịch sử chat theo userId (GET /api/chats?userId=...)
const getChatHistory = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ error: 'userId là bắt buộc' });
        const chats = await Chat.find({ userId }).sort({ updatedAt: -1 });
        return res.status(200).json({ data: chats });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
const axios = require('axios');
const Chat = require('../models/chat');

const createChatCompletion = async (req, res) => {
    try {
        let { messages, cityId, isUseKnowledge, model, userId, title } = req.body;
        if (!messages) {
            return res.status(400).json({ error: 'messages là bắt buộc' });
        }

        const payload = {
            messages,
            isUseKnowledge: isUseKnowledge !== undefined ? isUseKnowledge : true,
        };
        if (cityId) payload.cityId = cityId;
        if (model) payload.model = model;

        const response = await axios.post(process.env.RAG_SERVER_URL + '/v1/chat/completions', payload, {
            timeout: 20000,
        });

        if (userId) {
            if (!title) {
                const firstUserMsg = messages.find((m) => m.role === 'user');
                if (firstUserMsg && firstUserMsg.content) {
                    const words = firstUserMsg.content.trim().split(/\s+/);
                    title = words.slice(0, 8).join(' ');
                    if (words.length > 8) title += '...';
                } else {
                    title = 'Cuộc trò chuyện mới';
                }
            }
            const lastUserMsg = messages.filter((m) => m.role === 'user').slice(-1)[0];
            const assistantMsg =
                response.data.choices && response.data.choices[0] && response.data.choices[0].message
                    ? response.data.choices[0].message
                    : null;
            const chatMsgArr = [];
            if (lastUserMsg) {
                chatMsgArr.push({
                    role: 'user',
                    content: lastUserMsg.content,
                    city: cityId || null,
                    createdAt: new Date(),
                });
            }
            if (assistantMsg && assistantMsg.content) {
                chatMsgArr.push({
                    role: 'assistant',
                    content: assistantMsg.content,
                    city: cityId || null,
                    createdAt: new Date(),
                });
            }
            // Tìm chat theo userId và title, nếu chưa có thì tạo mới
            let chat = await Chat.findOne({ userId, title });
            if (!chat) {
                chat = new Chat({
                    userId,
                    title,
                    messages: chatMsgArr,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            } else {
                chat.messages = chat.messages.concat(chatMsgArr);
                chat.updatedAt = new Date();
            }
            await chat.save();
        }

        return res.json(response.data);
    } catch (err) {
        if (err.response) {
            return res.status(err.response.status).json(err.response.data);
        }
        return res.status(500).json({ error: err.message });
    }
};

// API tạo cuộc trò chuyện mới (POST /api/chats/new)
const createNewChat = async (req, res) => {
    try {
        const { userId, title } = req.body;
        if (!userId) {
            return res.status(400).json({ error: 'userId là bắt buộc' });
        }
        let chatTitle = title;
        if (!chatTitle) chatTitle = 'Cuộc trò chuyện trước đó';
        // Kiểm tra đã có chat này chưa
        let existed = await Chat.findOne({ userId, title: chatTitle });
        if (existed) {
            return res.status(200).json({ message: 'Đã tồn tại cuộc trò chuyện', data: existed });
        }
        const chat = new Chat({
            userId,
            title: chatTitle,
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        await chat.save();
        return res.status(201).json({ message: 'Tạo cuộc trò chuyện mới thành công', data: chat });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// API xóa cuộc trò chuyện (DELETE /api/chats/:id)
const deleteChat = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ error: 'Thiếu id cuộc trò chuyện' });
        const deleted = await Chat.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ error: 'Không tìm thấy cuộc trò chuyện' });
        return res.status(200).json({ message: 'Xóa cuộc trò chuyện thành công', data: deleted });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

module.exports = {
    createChatCompletion,
    createNewChat,
    deleteChat,
    getChatHistory,
    getChatById,
};
