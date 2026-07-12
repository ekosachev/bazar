package message

type MessageService struct {
	repo *MessageRepository
}

func NewMessageService(repo *MessageRepository) *MessageService {
	return &MessageService{repo: repo}
}
