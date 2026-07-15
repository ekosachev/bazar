package chat

import "github.com/google/uuid"

// ReadReceiptBroadcaster notifies other chat members that a user has read up to a message.
type ReadReceiptBroadcaster interface {
	BroadcastMessageRead(chatID, readerID, messageID uuid.UUID)
}
