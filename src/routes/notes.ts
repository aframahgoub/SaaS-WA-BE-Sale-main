import express from "express";
import * as NotesController from "../controllers/notes";
import { protect } from "../middleware/checkAuth";

const router=express.Router();
router.post("/:phone_no/:sender/new", protect, NotesController.postMessage);
router.post("/:phone_no/group/create", protect, NotesController.groupCreate);
router.post("/:phone_no/contact/create", protect, NotesController.contactCreate);
router.post("/:phone_no/contact/edit/:id", protect, NotesController.contactEdit);
router.post("/:phone_no/group/update", protect, NotesController.groupUpdate);
router.post("/:phone_no/:groupname", protect, NotesController.sendTemplate);
router.post("/:phone_no/:senderPhoneNumber/template", protect,NotesController.sendSingleTemplate);
router.get("/:phone_no/group", protect, NotesController.getGroups);
router.get("/:phone_no/group/:groupName", protect, NotesController.getGroupByName);
router.get("/:phone_no/campaign", protect, NotesController.getCampaigns);
router.get("/:phone_no/campaign/:campaignId", protect, NotesController.getCampaignById);
router.delete("/:phone_no/campaign/:campaignId", protect, NotesController.deleteCampaignById);
router.post("/:phone_no/:senderPhoneNumber/retry/:campaignId", protect, NotesController.retryTemplate);
router.post("/:phone_no/:sender/read", protect, NotesController.markAsReadById);
router.get("/:phone_no/:sender", protect, NotesController.getMessagesById);
router.get("/:phone_no", protect, NotesController.getMessages);

export default router;