"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = () => {
    const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
    const mailto =
      `mailto:sportschatplus.ai@gmail.com` +
      `?subject=${encodeURIComponent("SportsChatPlus Contact")}` +
      `&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  };

  const canSend = name.trim() !== "" && email.trim() !== "" && message.trim() !== "";

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Send a Message</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            placeholder="How can we help?"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <Button className="w-full" onClick={handleSend} disabled={!canSend}>
          Send Message
        </Button>
      </CardContent>
    </Card>
  );
}
