
import EmailValidatorForm from "./api/email_validator/emailValidatorForm";
import RootLayout from "./layout";

export default function Home() {

  return (
    <RootLayout>
      <EmailValidatorForm/>
    </RootLayout>
  );
}
