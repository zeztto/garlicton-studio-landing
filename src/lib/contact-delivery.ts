export function shouldAcknowledgeContactSubmission({
  emailSent,
  inquirySaved,
}: {
  emailSent: boolean
  inquirySaved: boolean
}): boolean {
  return inquirySaved || emailSent
}
