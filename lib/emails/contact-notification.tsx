import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Hr,
  Tailwind,
} from "@react-email/components";

export interface ContactNotificationEmailProps {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function ContactNotificationEmail({
  name,
  email,
  subject,
  message,
}: ContactNotificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New contact form: {subject}</Preview>
      <Tailwind>
        <Body className="bg-[#0e0e0e] font-sans">
          <Container className="mx-auto max-w-[600px] bg-[#1a1919] p-8">
            <Section>
              <Text className="m-0 text-[11px] font-bold uppercase tracking-[0.3em] text-[#ff915c]">
                Refine · Contact Form
              </Text>
              <Heading className="mt-2 text-2xl font-black tracking-tight text-white">
                {subject}
              </Heading>
            </Section>

            <Hr className="my-5 border-[#262626]" />

            <Section>
              <Text className="m-0 text-[10px] font-bold uppercase tracking-[0.2em] text-[#adaaaa]">
                From
              </Text>
              <Text className="m-0 mt-1 text-base text-white">
                {name} &lt;{email}&gt;
              </Text>
            </Section>

            <Section className="mt-6">
              <Text className="m-0 text-[10px] font-bold uppercase tracking-[0.2em] text-[#adaaaa]">
                Message
              </Text>
              <Text className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-white">
                {message}
              </Text>
            </Section>

            <Hr className="my-6 border-[#262626]" />

            <Text className="text-xs text-[#adaaaa]">
              Reply directly to this email to respond to {name}.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default ContactNotificationEmail;
