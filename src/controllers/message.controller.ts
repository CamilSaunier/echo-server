import { Request, Response } from "express";
import { MessageClient } from "../clients/message.client";

export class MessageController {
  private messageClient: MessageClient;

  constructor() {
    this.messageClient = new MessageClient();
  }

  /**
   * Récupère tous les messages.
   * Route: GET /messages
   */
  getMessages = async (req: Request, res: Response): Promise<void> => {
    try {
      const messages = await this.messageClient.getAllMessages();
      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ error: "Erreur interne du serveur." });
    }
  };

  /**
   * Crée un nouveau message.
   * Route: POST /messages
   */
  createMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { content } = req.body;
      const newMessage = await this.messageClient.createMessage(content);
      res.status(201).json(newMessage);
    } catch (error: any) {
      // Si l'erreur vient de notre règle métier (message vide)
      if (error.message === "Le contenu du message ne peut pas être vide.") {
        res.status(400).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: "Erreur interne du serveur." });
    }
  };
}
