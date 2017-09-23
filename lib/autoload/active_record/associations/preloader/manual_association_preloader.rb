# frozen_string_literal: true
module ActiveRecord::Associations::Preloader::ManualAssociationPreloader
  def initialize(klass, owners, reflection, records)
    super(klass, owners, reflection, nil)

    @records_by_owner = records.each_with_object({}) do |record, h|
      owner_id = convert_key(record[association_key_name])
      records = (h[owner_id] ||= [])
      records << record
    end
  end

  def scope
    raise NotImplementedError
  end

  def records_for(ids, &block)
    ids.flat_map { |id| @records_by_owner[id] }.tap(&:compact!).tap do |result|
      # In ActiveRecord 5.0.1, an ActiveRecord::Relation is expected to be returned.
      result.define_singleton_method(:load) do
        self
      end
    end
  end
end
