require 'rails_helper'

RSpec.describe GenericAnnouncement, type: :model do
  it { is_expected.to belong_to(:instance).inverse_of(:announcements) }
  it { is_expected.to validate_presence_of(:title) }

  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let!(:active_system_announcements) { create_list(:system_announcement, 1) }
    let!(:active_instance_announcements) { create_list(:instance_announcement, 1) }

    describe '.currently_active' do
      let!(:now) { Time.zone.now }
      let!(:inactive_announcements) do
        [
          create_list(:system_announcement, 3, start_at: now + 1.days, end_at: now + 2.days),
          create_list(:system_announcement, 3, start_at: now - 2.days, end_at: now - 1.days),
          create_list(:instance_announcement, 3, start_at: now + 1.days, end_at: now + 2.days),
          create_list(:instance_announcement, 3, start_at: now - 2.days, end_at: now - 1.days)
        ].flatten
      end

      it 'shows currently active announcements' do
        all = GenericAnnouncement.currently_active
        expect(all).to include(*active_system_announcements)
        expect(all).to include(*active_instance_announcements)
      end

      it 'does not show inactive announcements' do
        all = GenericAnnouncement.currently_active
        expect(all).to_not include(*inactive_announcements)
      end
    end

    describe '.default_scope' do
      it 'orders by descending start_at within type' do
        all = GenericAnnouncement.with_instance([nil, instance])
        system_announcements, instance_announcements = all.partition do |a|
          a.is_a?(System::Announcement)
        end

        comparator = proc { |x, y| x >= y }
        system_sorted = system_announcements.map(&:start_at).each_cons(2).all?(&comparator)
        instance_sorted = instance_announcements.map(&:start_at).each_cons(2).all?(&comparator)

        expect(system_sorted).to be_truthy
        expect(instance_sorted).to be_truthy
      end

      it 'orders system announcements before instance announcements' do
        announcements = GenericAnnouncement.with_instance([nil, instance])
        instance_announcements = announcements.drop_while { |a| a.is_a?(System::Announcement) }
        all_instance = instance_announcements.all? { |a| a.is_a?(Instance::Announcement) }
        expect(all_instance).to be_truthy
      end
    end

    describe '.for_instance' do
      it 'retrieves both instance announcements and global announcements' do
        announcements = GenericAnnouncement.for_instance(instance)
        expect(announcements).to include(*active_system_announcements)
        expect(announcements).to include(*active_instance_announcements)
      end
    end

    describe 'unread state' do
      let(:creator) { create(:creator) }
      let!(:user) { create(:user) }
      let!(:system_announcement) { create(:system_announcement, creator: creator) }
      let!(:instance_announcement) { create(:instance_announcement, creator: creator) }

      it 'has been read by the creator' do
        expect(creator.have_read?(instance_announcement)).to eq(true)
        expect(creator.have_read?(system_announcement)).to eq(true)
      end

      it 'is unread by other users' do
        expect(user.have_read?(instance_announcement)).to eq(false)
        expect(user.have_read?(system_announcement)).to eq(false)
      end
    end
  end
end
