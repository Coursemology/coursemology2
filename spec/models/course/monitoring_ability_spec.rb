# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Monitoring, type: :model do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    subject { Ability.new(user, course, course_user) }
    let(:course) { create(:course) }
    let(:monitor) { create(:course_monitoring_monitor) }
    let(:session) { create(:course_monitoring_session, monitor: monitor) }
    let(:heartbeat) { create(:course_monitoring_heartbeat, session: session) }

    context 'when the user is a Course Student' do
      let(:course_user) { create(:course_student, course: course) }
      let(:user) { course_user.user }
      let(:own_session) { create(:course_monitoring_session, creator: user) }
      let(:own_heartbeat) { create(:course_monitoring_heartbeat, session: own_session) }

      it { is_expected.not_to be_able_to(:manage, monitor) }
      it { is_expected.not_to be_able_to(:manage, session) }
      it { is_expected.not_to be_able_to(:manage, heartbeat) }

      it { is_expected.to be_able_to(:create, own_session) }
      it { is_expected.to be_able_to(:read, own_session) }
      it { is_expected.to be_able_to(:update, own_session) }
      it { is_expected.not_to be_able_to(:delete, own_session) }

      it { is_expected.to be_able_to(:create, own_heartbeat) }
      it { is_expected.not_to be_able_to(:read, own_heartbeat) }
      it { is_expected.not_to be_able_to(:update, own_heartbeat) }
      it { is_expected.not_to be_able_to(:delete, own_heartbeat) }
    end

    context 'when the user is a Course Teaching Assistant' do
      let(:course_user) { create(:course_teaching_assistant, course: course) }
      let(:user) { course_user.user }

      it { is_expected.not_to be_able_to(:manage, monitor) }
      it { is_expected.not_to be_able_to(:manage, session) }
      it { is_expected.not_to be_able_to(:manage, heartbeat) }

      it { is_expected.to be_able_to(:read, monitor) }
      it { is_expected.to be_able_to(:read, session) }
      it { is_expected.to be_able_to(:delete, monitor) }
      it { is_expected.to be_able_to(:delete, session) }
      it { is_expected.to be_able_to(:update, session) }
      it { is_expected.to be_able_to(:read, heartbeat) }
    end

    context 'when the user is a Course Observer' do
      let(:course_user) { create(:course_observer, course: course) }
      let(:user) { course_user.user }

      it { is_expected.not_to be_able_to(:manage, monitor) }
      it { is_expected.not_to be_able_to(:manage, session) }
      it { is_expected.not_to be_able_to(:manage, heartbeat) }

      it { is_expected.to be_able_to(:read, monitor) }
      it { is_expected.to be_able_to(:read, session) }
      it { is_expected.to be_able_to(:read, heartbeat) }
    end

    context 'when the user is a Course Manager' do
      let(:course_user) { create(:course_manager, course: course) }
      let(:user) { course_user.user }

      it { is_expected.to be_able_to(:manage, monitor) }
      it { is_expected.to be_able_to(:manage, session) }
      it { is_expected.to be_able_to(:manage, heartbeat) }
    end
  end
end
