require 'rails_helper'

RSpec.describe Course::Announcement, type: :model do
  it { is_expected.to belong_to(:course).inverse_of(:announcements) }
  it { is_expected.to validate_presence_of(:title) }

  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    context 'when announcement is created' do
      subject { Course::Announcement.new }

      it { is_expected.not_to be_sticky }
    end

    context 'when title is not present' do
      subject { build(:course_announcement, title: '') }

      it { is_expected.not_to be_valid }
    end

    context 'unread status' do
      let!(:first_user) { create(:administrator) }
      let!(:second_user) { create(:administrator) }
      let!(:course) { create(:course) }

      describe 'announcement creation' do
        let!(:another_course) { create(:course) }

        let!(:first_user_unread) do
          create_list(:course_announcement, 5, course: course, creator: second_user)
        end
        let!(:second_user_unread) do
          create_list(:course_announcement, 5, course: course, creator: first_user)
        end
        let!(:another_ann) do
          create_list(:course_announcement, 5, course: another_course, creator: first_user)
        end
        let!(:create_ann) { create(:course_announcement, course: course, creator: first_user) }

        it 'does not change unread announcement number of creator' do
          expect(course.announcements.unread_by(first_user).count).to eq(5)
        end

        it 'increases unread number by 1 for other users' do
          expect(course.announcements.unread_by(second_user).count).to eq(6)
        end

        it 'does not change unread announcement number of another course' do
          expect(another_course.announcements.unread_by(second_user).count).to eq(5)
        end
      end

      describe 'announcement editing' do
        let!(:first_announcement) do
          create(:course_announcement, course: course, creator: first_user)
        end
        let!(:second_announcement) do
          create(:course_announcement, course: course, creator: second_user)
        end

        it 'does not change unread announcement number of updater' do
          expect do
            User.with_stamper(first_user) do
              first_announcement.update(content: 'edited')
            end
          end.not_to change { course.announcements.unread_by(first_user).count }
        end

        it 'marks announcement which has been read by others as unread' do
          expect do
            second_announcement.update(content: 'edited', updater: first_user)
          end.to change { course.announcements.unread_by(second_user).count }.by(1)
        end
      end
    end
  end
end
