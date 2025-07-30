import { redirect } from "next/navigation";
import { auth, signOut } from "./auth";

export const getSession = async () => {
  const session = await auth();

  const user = session?.user;

  if (!user || !user.email) {
    await signOut();
    redirect("/entrar");
  }

  return {
    user,
  };
};

export function generateOTP() {
  // Generate a random number between 0 and 999999
  const randomNumber = Math.floor(Math.random() * 1000000);

  // Pad the number with leading zeros if necessary to ensure it is always 6 digits
  const otp = randomNumber.toString().padStart(6, "0");

  return otp;
}
