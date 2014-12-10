require 'rails_helper'

RSpec.describe User, type: :model do
  describe '#email' do
    context 'when the user has no email addresses' do
      let(:user) { User.new }
      it 'does not have a default email' do
        expect(user.email).to eq(nil)
      end
    end

    context 'when the user has multiple email address' do
      context 'no email address is primary' do
        let(:user) do
          user = build(:user, emails_count: 4)
          user.emails.each { |email_record| email_record.primary = false }
          user.emails.each.take(2).each { |email_record| email_record.mark_for_destruction }
          user
        end

        it 'picks the first non-deleted email as the primary email' do
          not_marked_for_destruction = user.emails.each.select do |email_record|
            !email_record.marked_for_destruction?
          end
          expect(user.email).to eq(not_marked_for_destruction.first.email)
        end
      end
    end
  end

  describe '#email=' do
    context 'when the user has no email addresses' do
      let(:user) do
        result = build(:user, emails_count: 0)
        result.email = generate(:email)
        result
      end
      it 'creates a new UserEmail' do
        expect(user.emails.length).to_not eq(0)
      end

      it 'creates a new primary UserEmail' do
        expect(user.emails[0].primary?).to eq(true)
      end

      it 'deletes the only email address when assigning nil' do
        user.email = nil
        expect(user.email).to eq(nil)

        remaining_emails = user.emails.reject { |user_email| user_email.marked_for_destruction? }
        expect(remaining_emails.length).to eq(0)
      end
    end

    context 'when the user has multiple email addresses' do
      let(:user) { build(:user, emails_count: 2) }
      context 'when there is no primary email set' do
        it 'sets the first email as primary' do
          user.email = 'test1a@email'
          email_record = user.send(:default_email_record)
          expect(email_record.primary?).to eq(true)
          expect(email_record.email).to eq('test1a@email')
        end
      end
    end
  end

  describe '#emails' do
    let(:user) { create(:user, emails_count: 5) }
    it 'only allows one primary email' do
      user.emails.each.each { |email_record| email_record.primary = true }
      expect { user.save! } .to raise_error(ActiveRecord::RecordInvalid)
    end
  end

  describe 'role' do
    let(:user) { User.new }
    it 'expects to be normal role by default' do
      pending 'waiting for the fix of enum validation'
      expect(user.normal?).to eq(true)
    end
  end
end
