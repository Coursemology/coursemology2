# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Submission::MonitoringService, type: :service do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, :view_password, course: course) }
    let(:submission) { create(:submission, assessment: assessment) }

    let(:base_user_agent) { 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko)' }
    let(:browser_session) { {} }

    subject { described_class.for(submission, assessment, browser_session) }

    context 'when the assessment has no monitor' do
      it { is_expected.to be_nil }
    end

    context 'when the assessment has a monitor' do
      let!(:monitor) { create(:course_monitoring_monitor, assessment: assessment) }

      it 'retrieves the submission session' do
        expect(subject.session).to eq(monitor.sessions.first)
      end

      describe '#listening?' do
        it 'returns true when the monitor is enabled' do
          expect(subject.listening?).to be_truthy
        end

        it 'returns false when the monitor is disabled' do
          monitor.update!(enabled: false)

          expect(subject.listening?).to be_falsey
        end
      end

      describe '#stop!' do
        it 'stops the session' do
          expect(Course::Monitoring::HeartbeatChannel).to receive(:broadcast_terminate).once
          expect(Course::Monitoring::LiveMonitoringChannel).to receive(:broadcast_terminate).once

          expect { subject.stop! }.
            to change { subject.session.stopped? }.from(false).to(true).
            and change { subject.session.listening? }.from(true).to(false).
            and change { subject.listening? }.from(true).to(false)
        end
      end

      describe '#continue_listening!' do
        it 'sets the session to continue listening' do
          subject.session.update!(status: :stopped)

          expect { subject.continue_listening! }.
            to change { subject.session.stopped? }.from(true).to(false).
            and change { subject.session.listening? }.from(false).to(true).
            and change { subject.listening? }.from(false).to(true)
        end
      end

      describe '#should_block?' do
        let(:valid_request) do
          ActionDispatch::Request.new({ 'HTTP_USER_AGENT' => "#{base_user_agent} #{monitor.secret}" })
        end

        let(:invalid_request) do
          ActionDispatch::Request.new({ 'HTTP_USER_AGENT' => "#{base_user_agent} #{SecureRandom.hex}" })
        end

        before { monitor.update!(secret: SecureRandom.hex) }

        context 'when the monitor blocks' do
          before do
            assessment.update!(session_password: SecureRandom.hex)
            monitor.update!(blocks: true)
          end

          it 'blocks when the user agent is invalid' do
            expect(subject.should_block?(invalid_request)).to be_truthy
          end

          it 'does not block when the user agent is valid' do
            expect(subject.should_block?(valid_request)).to be_falsey
          end

          it 'does not block when the user agent is invalid but the browser session is unblocked' do
            Course::Assessment::MonitoringService.new(assessment, browser_session).unblock(assessment.session_password)

            expect(subject.should_block?(invalid_request)).to be_falsey
          end
        end

        context 'when the monitor does not block' do
          before { monitor.update!(blocks: false) }

          it 'does not block when the user agent is invalid' do
            expect(subject.should_block?(invalid_request)).to be_falsey
          end

          it 'does not block when the user agent is valid' do
            expect(subject.should_block?(valid_request)).to be_falsey
          end
        end
      end

      describe 'static methods' do
        it 'can set the session to continue listening' do
          subject.session.update!(status: :stopped)

          expect { described_class.continue_listening_from(assessment, [submission.creator.id]) }.
            to change { subject.session.reload.stopped? }.from(true).to(false).
            and change { subject.session.reload.listening? }.from(false).to(true).
            and change { subject.listening? }.from(false).to(true)
        end

        it 'can destroy the sessions' do
          subject.create_new_session_if_not_exist!

          expect { described_class.destroy_all_by(assessment, [submission.creator.id]) }.
            to change { monitor.sessions.count }.by(-1)
        end
      end
    end
  end
end
