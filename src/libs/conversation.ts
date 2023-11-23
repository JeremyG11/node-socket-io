import { prisma } from "./db";

export const findOrCreateConversation = async (
  userProfileOneId: string,
  userProfileTwoId: string
) => {
  let conversation =
    (await findConversation(userProfileOneId, userProfileTwoId)) ||
    (await findConversation(userProfileTwoId, userProfileOneId));

  if (!conversation) {
    conversation = await createNewConversation(
      userProfileOneId,
      userProfileTwoId
    );
  }

  return conversation;
};

const findConversation = async (
  userProfileOneId: string,
  userProfileTwoId: string
) => {
  try {
    return await prisma.conversation.findFirst({
      where: {
        AND: [
          { userProfileOneId: userProfileOneId },
          { userProfileTwoId: userProfileTwoId },
        ],
      },
      include: {
        userProfileOne: true,
        userProfileTwo: true,
        messages: true,
      },
    });
  } catch (error) {
    console.error("Error finding conversation:", error);
    return null;
  }
};

const createNewConversation = async (
  userProfileOneId: string,
  userProfileTwoId: string
) => {
  try {
    return await prisma.conversation.create({
      data: {
        userProfileOneId,
        userProfileTwoId,
      },
      include: {
        userProfileOne: true,
        userProfileTwo: true,
        messages: true,
      },
    });
  } catch {
    return null;
  }
};
