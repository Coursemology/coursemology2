# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Announcement, type: :model do
  it { is_expected.to belong_to(:course).inverse_of(:announcements) }
  it { is_expected.to validate_presence_of(:title) }

  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let!(:user) { create(:user) }
    let(:course) { create(:course) }

    describe 'validations' do
      subject { build(:course_announcement) }
      context 'when start date is after end date' do
        before { subject.start_at = subject.end_at + 3.days }
        it 'is invalid' do
          expect(subject).to be_invalid
          expect(subject.errors[:start_at]).to include(I18n.t('activerecord.errors.models.' \
            'course/announcement.attributes.start_at.cannot_be_after_end_at'))
        end
      end
    end

    describe 'create an announcement' do
      context 'when announcement is created' do
        subject { Course::Announcement.new }

        it { is_expected.not_to be_sticky }
      end

      context 'when title is not present' do
        subject { build(:course_announcement, title: '') }

        it { is_expected.not_to be_valid }
      end

      describe 'unread status' do
        let!(:creator) { create(:user) }
        let(:another_course) { create(:course) }
        let!(:new_announcement) do
          create(:course_announcement, course: course, creator: creator)
        end

        it 'has been read by the creator' do
          expect(creator.have_read?(new_announcement)).to eq(true)
        end

        it 'is unread by other users' do
          expect(user.have_read?(new_announcement)).to eq(false)
        end

        it 'does not change unread announcement number of another course' do
          expect(another_course.announcements.unread_by(user).count).to eq(0)
        end
      end
    end

    describe 'edit an announcement' do
      describe 'unread status' do
        let!(:updater) { create(:user) }
        let!(:announcement) { create(:course_announcement, course: course) }

        it 'has been read by the updater' do
          User.with_stamper(updater) { announcement.update(content: 'edited') }
          expect(updater.have_read?(announcement)).to eq(true)
        end

        it 'marks announcement which has been read by others as unread' do
          subject do
            announcement.mark_as_read for: user
            announcement.update(content: 'edited', updater: updator)
          end

          expect(user.have_read?(announcement)).to eq(false)
        end
      end
    end
  end
end
