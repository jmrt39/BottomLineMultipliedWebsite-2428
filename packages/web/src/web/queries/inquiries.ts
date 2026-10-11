import { orpc } from "../lib/api";

/** Sends the discovery conversation request from the inquiry dialog. */
export const createInquiryOptions = () => orpc.inquiries.create.mutationOptions();
