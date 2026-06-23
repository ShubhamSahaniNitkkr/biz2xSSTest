import PageHeader from '../components/PageHeader';
import StickyChatbot from '../components/StickyChatbot';

export default function ChatPage() {
  return (
    <div className="fade-in">
      <PageHeader
        title="AI Assistant"
        subtitle="Ask anything about your payslip, deductions, or tax savings. Answers are grounded in your personal data only."
        badge="Chat"
      />

      <div className="chat-page-wrap">
        <StickyChatbot expanded />
      </div>
    </div>
  );
}
