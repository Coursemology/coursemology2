# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::MonitoringService, type: :service do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, :view_password, course: course) }

    let(:base_user_agent) { 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko)' }
    let(:browser_session) { {} }

    subject { described_class.new(assessment, browser_session) }

    context 'when the assessment has no monitor' do
      it 'does not retrieve a monitor' do
        expect(subject.monitor).to eq(nil)
      end

      it 'creates a monitor with valid params' do
        params = {
          enabled: true,
          secret: SecureRandom.hex,
          min_interval_ms: 3000,
          max_interval_ms: 3100,
          offset_ms: 2000
        }

        expect { subject.upsert!(params) }.to change { subject.monitor }.from(nil)
      end

      it 'never blocks' do
        expect(subject.should_block?(SecureRandom.hex)).to be_falsey
      end
    end

    context 'when the assessment has a monitor' do
      let!(:monitor) { create(:course_monitoring_monitor, assessment: assessment) }

      it 'retrieves the monitor' do
        expect(subject.monitor).to eq(monitor)
      end

      it 'updates the monitor with valid params' do
        params = {
          enabled: !monitor.enabled,
          secret: SecureRandom.hex,
          min_interval_ms: monitor.min_interval_ms + 3000,
          max_interval_ms: monitor.max_interval_ms + 3100,
          offset_ms: monitor.offset_ms + 2000
        }

        expect { subject.upsert!(params) }.
          to change { subject.monitor.enabled }.to(params[:enabled]).
          and change { subject.monitor.secret }.to(params[:secret]).
          and change { subject.monitor.min_interval_ms }.to(params[:min_interval_ms]).
          and change { subject.monitor.max_interval_ms }.to(params[:max_interval_ms]).
          and change { subject.monitor.offset_ms }.to(params[:offset_ms])

        expect(subject.monitor.id).to eq(monitor.id)
      end

      context 'when the monitor blocks' do
        let(:valid_user_agent) { "#{base_user_agent} #{monitor.secret}" }
        let(:invalid_user_agent) { "#{base_user_agent} #{SecureRandom.hex}" }

        before do
          assessment.update!(session_password: SecureRandom.hex)
          monitor.update!(secret: SecureRandom.hex, blocks: true)
        end

        it 'blocks when the user agent is invalid' do
          expect(subject.should_block?(invalid_user_agent)).to be_truthy
        end

        it 'does not block when the user agent is valid' do
          expect(subject.should_block?(valid_user_agent)).to be_falsey
        end

        it 'does not block when the user agent is invalid but the browser session is unblocked' do
          browser_session[described_class.unblocked_browser_session_key(assessment.id)] = true

          expect(subject.should_block?(invalid_user_agent)).to be_falsey
        end

        it 'can unblock a browser with an invalid user agent' do
          invalid_user_agent = "#{base_user_agent} #{SecureRandom.hex}"

          expect { subject.unblock(assessment.session_password) }.
            to change { subject.should_block?(invalid_user_agent) }.from(true).to(false).
            and change { browser_session }.from({})
        end
      end

      context 'when the monitor does not block' do
        it 'cannot be set to block if the assessment is not session-protected' do
          monitor.update!(secret: SecureRandom.hex)
          assessment.update!(session_password: nil)

          expect { subject.upsert!(blocks: true) }.to raise_error(ActiveRecord::RecordInvalid)
        end

        it 'cannot be set to block if the monitor does not have a secret' do
          monitor.update!(secret: nil)
          assessment.update!(session_password: SecureRandom.hex)

          expect { subject.upsert!(blocks: true) }.to raise_error(ActiveRecord::RecordInvalid)
        end

        it 'can be set to block if the assessment is session-protected and the monitor has a secret' do
          monitor.update!(secret: SecureRandom.hex)
          assessment.update!(session_password: SecureRandom.hex)

          expect { subject.upsert!(blocks: true) }.to change { subject.monitor.blocks }.from(false).to(true)
        end
      end
    end
  end
end
