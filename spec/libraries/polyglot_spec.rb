# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Extension: Coursemology::Polyglot' do
  describe Coursemology::Polyglot::Language, type: :model do
    class self::DummyLanguage < Coursemology::Polyglot::Language
    end

    class self::WorkingLanguage < self::DummyLanguage
      syntax_highlighter 'python'
      concrete_language 'Working Language'
    end

    after(:each) do
      # Clean up, because these dummy classes might influence the other specs e.g. when listing
      # the languages for a programming question.
      self.class::WorkingLanguage.instance.delete
      self.class::WorkingLanguage.remove_instance_variable(:@root_instance)
    end

    describe '#polyglot_name' do
      subject { self.class::WorkingLanguage.new(name: 'Workinglanguage 0.3.4') }
      it 'returns correct language name' do
        expect(subject.polyglot_name).to eq 'workinglanguage'
      end
    end

    describe '#polyglot_version' do
      subject { self.class::WorkingLanguage.new(name: 'Workinglanguage 0.3.4') }
      it 'returns correct language version' do
        expect(subject.polyglot_version).to eq '0.3.4'
      end
    end

    # A family of three versions with a distinctive name, so it cannot collide with any seeded
    # language. The 2.9 / 2.10 pair is deliberate: it distinguishes numeric ordering from
    # lexicographic, which would place '2.10' before '2.9'.
    class self::FamilyV1 < Coursemology::Polyglot::Language
      syntax_highlighter 'python'
      concrete_language 'Zzdummy 1.0'
    end

    class self::FamilyV2Point9 < Coursemology::Polyglot::Language
      syntax_highlighter 'python'
      concrete_language 'Zzdummy 2.9'
    end

    class self::FamilyV2Point10 < Coursemology::Polyglot::Language
      syntax_highlighter 'python'
      concrete_language 'Zzdummy 2.10'
    end

    describe 'version and family helpers' do
      let(:v1) { self.class::FamilyV1.instance }
      let(:v2point9) { self.class::FamilyV2Point9.instance }
      let(:v2point10) { self.class::FamilyV2Point10.instance }

      # Root language records are readonly (see +set_readonly+), so the enabled flag can only be
      # changed the way db:set_polyglot_language_flags does it — through the relation.
      def deprecate(language)
        Coursemology::Polyglot::Language.where(id: language.id).update_all(enabled: false)
        language.reload
      end

      before do
        [v1, v2point9, v2point10].each do |language|
          Coursemology::Polyglot::Language.where(id: language.id).update_all(enabled: true)
        end
      end

      after(:each) do
        [self.class::FamilyV1, self.class::FamilyV2Point9, self.class::FamilyV2Point10].each do |klass|
          klass.instance.delete
          klass.remove_instance_variable(:@root_instance)
        end
      end

      describe '#comparable_polyglot_version' do
        it 'returns the version as integers' do
          expect(v2point10.comparable_polyglot_version).to eq([2, 10])
        end

        it 'orders numerically rather than lexicographically' do
          expect(v2point10.comparable_polyglot_version <=> v2point9.comparable_polyglot_version).to eq(1)
          expect('2.10' <=> '2.9').to eq(-1) # the ordering this avoids
        end

        it 'returns an empty array for a version-less language' do
          language = self.class::WorkingLanguage.new(name: 'Workinglanguage')
          expect(language.comparable_polyglot_version).to eq([])
        end
      end

      describe '#family_siblings' do
        it 'returns every version sharing a polyglot name, including itself' do
          expect(v1.family_siblings).to contain_exactly(v1, v2point9, v2point10)
        end

        it 'excludes languages from other families' do
          expect(v1.family_siblings.map(&:polyglot_name).uniq).to eq(['zzdummy'])
        end

        it 'includes deprecated versions' do
          deprecate(v1)
          expect(v2point10.family_siblings).to include(v1)
        end
      end

      describe '#upgrade_targets' do
        it 'returns non-deprecated siblings, newest first' do
          expect(v1.upgrade_targets).to eq([v2point10, v2point9, v1])
        end

        it 'excludes deprecated versions' do
          deprecate(v2point10)
          expect(v1.upgrade_targets).to eq([v2point9, v1])
        end
      end

      describe '#latest_in_family' do
        it 'returns the newest version' do
          expect(v1.latest_in_family).to eq(v2point10)
        end

        it 'ignores deprecated versions even when they are newest' do
          deprecate(v2point10)
          expect(v1.latest_in_family).to eq(v2point9)
        end

        it 'returns nil when every version in the family is deprecated' do
          [v1, v2point9, v2point10].each { |language| deprecate(language) }
          expect(v1.latest_in_family).to be_nil
        end
      end

      describe '#deprecated?' do
        it 'is false while the language is enabled' do
          expect(v1).not_to be_deprecated
        end

        it 'is true once the language is disabled' do
          expect(deprecate(v1)).to be_deprecated
        end
      end

      describe '#upgradable?' do
        it 'is true when a newer version exists' do
          expect(v1).to be_upgradable
        end

        it 'is false for the newest version' do
          expect(v2point10).not_to be_upgradable
        end

        it 'is false when every version in the family is deprecated' do
          [v1, v2point9, v2point10].each { |language| deprecate(language) }
          expect(v1).not_to be_upgradable
        end

        # A deprecated language has to be migrated off regardless of direction, so the only available
        # target being older still counts as upgradable.
        it 'is true for a deprecated newest version when an older one is still available' do
          deprecate(v2point10)
          expect(v2point10).to be_upgradable
          expect(v2point10.latest_in_family).to eq(v2point9)
        end
      end
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
