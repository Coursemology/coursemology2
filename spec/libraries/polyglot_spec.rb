# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Extension: Coursemology::Polyglot' do
  describe Coursemology::Polyglot::Language, type: :model do
    class self::DummyLanguage < Coursemology::Polyglot::Language
    end

    class self::WorkingLanguage < self::DummyLanguage
      concrete_language 'Working Language'
    end

    after(:each) do
      # Clean up, because these dummy classes might influence the other specs e.g. when listing
      # the languages for a programming question.
      self.class::WorkingLanguage.instance.delete
      self.class::WorkingLanguage.remove_instance_variable(:@root_instance)
    end

    subject { self.class::DummyLanguage }

    describe 'Validations' do
      subject { self.class::WorkingLanguage }

      describe '#parent' do
        it 'only allows one unique root' do
          language = subject.new(name: 'Dummy Language 3')
          expect(language).not_to be_valid
          expect(language.errors[:parent]).not_to be_nil
        end
      end
    end

    describe '.with_language' do
      subject { self.class::WorkingLanguage }
      it 'only shows the languages specified' do
        expect(Coursemology::Polyglot::Language.with_language([subject.instance.name])).to \
          contain_exactly(subject.instance)
      end

      context 'when an empty array is specified' do
        it 'returns all languages' do
          expect(Coursemology::Polyglot::Language.with_language([])).to \
            contain_exactly(*Coursemology::Polyglot::Language.all.to_a)
        end
      end
    end

    describe '.root_instance' do
      subject { self.class::WorkingLanguage }

      it 'returns the object without any parent' do
        expect(subject.send(:root_instance).parent).to be_nil
      end

      it 'creates the language in the database' do
        expect(subject.instance).to be_persisted
        expect(subject.instance).to be_readonly
      end
    end
  end
end
