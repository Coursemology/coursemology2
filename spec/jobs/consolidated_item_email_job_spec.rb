# frozen_string_literal: true
require 'rails_helper'

RSpec.describe ConsolidatedItemEmailJob do
  include ActiveSupport::Testing::TimeHelpers

  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    describe '#perform' do
      # The job notifies courses whose *local* time has just passed midnight. Freezing to 00:30 UTC
      # puts 'UTC' in that window and 'Singapore' (UTC+8) at 08:30, well outside it.
      let(:just_past_midnight_utc) { Time.utc(2026, 1, 1, 0, 30) }
      let!(:midnight_course) { create(:course, time_zone: 'UTC') }
      let!(:daytime_course) { create(:course, time_zone: 'Singapore') }

      # Records are created outside the frozen window, and the notifier is stubbed so the job
      # commits nothing while time is travelled — this suite has no cleanup, and rows written under
      # a travelled clock would outlive the example and skew other specs.
      # Stubbed on the instance, not the class: Notifier::Base dispatches `opening_reminder`
      # through method_missing, so a class-level stub fails verifying doubles.
      def notified_course_ids
        notified = []
        allow_any_instance_of(Course::ConsolidatedOpeningReminderNotifier).
          to receive(:opening_reminder) { |_, course| notified << course.id }
        travel_to(just_past_midnight_utc) { described_class.new.perform }
        notified
      end

      it 'notifies courses whose local time has just passed midnight' do
        expect(notified_course_ids).to include(midnight_course.id)
      end

      it 'does not notify courses whose local time is not midnight' do
        expect(notified_course_ids).not_to include(daytime_course.id)
      end

      it 'ignores courses with no time zone set' do
        no_zone_course = create(:course, time_zone: nil)

        expect(notified_course_ids).not_to include(no_zone_course.id)
      end
    end
  end
end
