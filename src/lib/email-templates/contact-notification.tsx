import React from 'react'
import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  message?: string
  audience?: string
  receivedAt?: string
  accountLinked?: boolean
  threadId?: string
}

const Email = ({ message, audience, receivedAt, accountLinked, threadId }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New anonymous message from MrsANONymous.org</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>MrsANONymous.org</Text>
        <Heading style={heading}>New anonymous message</Heading>
        <Section style={card}>
          <Text style={body}>{message ?? '(no message content)'}</Text>
        </Section>
        <Section style={{ textAlign: 'center' as const, margin: '22px 0 6px' }}>
          <Button
            href={
              threadId
                ? `https://mrsanonymous.org/admin/messages?thread=${threadId}`
                : 'https://mrsanonymous.org/admin/messages'
            }
            style={button}
          >
            Reply to this message
          </Button>
        </Section>
        <Text style={warn}>
          Replying to this email does NOT reach the sender. Senders are anonymous and have
          no email address — you must reply from the admin messages page so your reply lands
          in their in-app Inbox.
        </Text>
        <Hr style={hr} />
        <Text style={meta}>Audience: {audience ?? 'women'}</Text>
        <Text style={meta}>Received: {receivedAt ?? new Date().toISOString()}</Text>
        <Text style={meta}>
          {accountLinked
            ? 'Sender has an anonymous account — reply from the admin messages page and it appears in their Inbox.'
            : 'Sender has no account — no reply channel is available.'}
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'New anonymous message — MrsANONymous.org',
  displayName: 'Contact message notification',
  previewData: {
    message: 'I need help finding a shelter near me.',
    audience: 'women',
    receivedAt: new Date().toISOString(),
    accountLinked: true,
    threadId: '00000000-0000-0000-0000-000000000000',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Georgia, serif' }
const container = { padding: '28px 26px', maxWidth: '600px' }
const eyebrow = { fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#c48b81', margin: '0' }
const heading = { fontSize: '24px', color: '#1a1a1a', margin: '8px 0 18px' }
const card = { backgroundColor: '#faf7f5', border: '1px solid #eadfd9', borderRadius: '10px', padding: '18px' }
const body = { fontSize: '15px', lineHeight: '1.7', color: '#1a1a1a', whiteSpace: 'pre-wrap' as const, margin: '0' }
const hr = { borderColor: '#eadfd9', margin: '22px 0 14px' }
const meta = { fontSize: '12px', color: '#6b6b6b', margin: '4px 0' }
const button = { backgroundColor: '#c0392b', color: '#ffffff', fontSize: '14px', fontWeight: 'bold' as const, padding: '12px 22px', borderRadius: '999px', textDecoration: 'none' }
const warn = { fontSize: '12px', lineHeight: '1.6', color: '#8a4b43', backgroundColor: '#fdf1ef', border: '1px solid #f2d6d1', borderRadius: '8px', padding: '10px 12px', margin: '12px 0 0' }