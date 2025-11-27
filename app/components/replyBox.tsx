"use client";

import React, { useState } from "react";
import axios from "axios";
import { Send } from "lucide-react";

interface ReplyBoxProps {
  recipient: string;
  messageId: string;
}

export default function ReplyBox({ recipient, messageId }: ReplyBoxProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReply = async () => {
    if (!content.trim()) return;
    setLoading(true);

    try {
      await axios.post(
        `/api/replyMessage?recipient=${recipient}`,
        { messageId, content },
        { withCredentials: true }
      );
      setContent("");
    } catch (error) {
      console.error("Failed to send reply:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 flex items-center gap-2">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a reply..."
        className="flex-1 border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-[#55efc4]"
      />
      <button
        onClick={handleReply}
        disabled={loading}
        className="bg-[#55efc4] text-black px-3 py-1 rounded-lg text-sm font-semibold hover:bg-[#48d9b0] flex items-center gap-1"
      >
        <Send className="h-4 w-4" />
        {loading ? "..." : "Send"}
      </button>
    </div>
  );
}
