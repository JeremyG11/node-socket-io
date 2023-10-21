import { prisma } from "./db";

export const findOrCreateConversation = async (
  userProfileOneId: string,
  userProfileTwoId: string
) => {
  const conversation = await prisma.conversation.findUnique({
    where: {
      userProfileOneId_userProfileTwoId: {
        userProfileOneId,
        userProfileTwoId,
      },
    },
  });

  if (!conversation) {
    const newConversation = await prisma.conversation.create({
      data: {
        userProfileOneId,
        userProfileTwoId,
      },
    });

    return newConversation;
  }
  return conversation;
};
