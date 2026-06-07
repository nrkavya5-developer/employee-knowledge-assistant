from datetime import datetime

from pydantic import BaseModel


class MessageResponse(BaseModel):
    id: str
    chat_id: str
    role: str
    content: str
    sources: dict | None = None
    feedback: bool | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class ChatResponse(BaseModel):
    id: str
    user_id: str
    title: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ChatDetailResponse(BaseModel):
    id: str
    user_id: str
    title: str
    created_at: datetime
    updated_at: datetime
    messages: list[MessageResponse]

    class Config:
        from_attributes = True


class SendMessageRequest(BaseModel):
    content: str


class SendMessageResponse(BaseModel):
    message: MessageResponse
    answer: MessageResponse


class FeedbackRequest(BaseModel):
    feedback: bool
