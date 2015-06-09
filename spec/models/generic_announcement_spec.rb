require 'rails_helper'

RSpec.describe GenericAnnouncement, type: :model do
  describe '.currently_valid' do
    let!(:now) { Time.zone.now }
    let!(:valid_system) { create_list(:system_announcement, 3) }
    let!(:valid_instance) do
      create_list(:instance_announcement, 3, valid_from: now, valid_to: now + 1.days)
    end
    let!(:invalid) do
      [
        create_list(:system_announcement, 3, valid_from: now + 1.days, valid_to: now + 2.days),
        create_list(:system_announcement, 3, valid_from: now - 2.days, valid_to: now - 1.days),
        create_list(:instance_announcement, 3, valid_from: now + 1.days, valid_to: now + 2.days),
        create_list(:instance_announcement, 3, valid_from: now - 2.days, valid_to: now - 1.days)
      ].flatten
    end

    it 'shows currently valid announcements' do
      all = GenericAnnouncement.currently_valid
      expect(all).to include(*valid_system)
      expect(all).to include(*valid_instance)
    end

    it 'does not show invalid announcements' do
      all = GenericAnnouncement.currently_valid
      expect(all).to_not include(*invalid)
    end

    it 'orders by descending valid_from within type' do
      all = GenericAnnouncement.currently_valid
      system_a, instance_a = all.partition { |a| a.is_a? SystemAnnouncement }
      desc_comparator = proc { |x, y| (x <=> y) >= 0 }

      system_sorted = system_a.map(&:valid_from).each_cons(2).all?(&desc_comparator)
      instance_sorted = instance_a.map(&:valid_from).each_cons(2).all?(&desc_comparator)

      expect(system_sorted).to be_truthy
      expect(instance_sorted).to be_truthy
    end

    it 'orders system announcements before instance announcements' do
      announcements = GenericAnnouncement.currently_valid
      instance_announcements = announcements.drop_while { |a| a.is_a? SystemAnnouncement }
      all_instance = instance_announcements.all? { |a| a.is_a? Instance::Announcement }
      expect(all_instance).to be_truthy
    end
  end
end
