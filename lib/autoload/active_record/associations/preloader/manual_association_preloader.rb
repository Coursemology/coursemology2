module ActiveRecord::Associations::Preloader::ManualAssociationPreloader
  def initialize(klass, owners, reflection, records)
    super(klass, owners, reflection, nil)

    @records_by_owner = records.each_with_object({}) do |record, h|
      owner_id = record[association_key_name]
      owner_id = owner_id.to_s if key_conversion_required?
      records = (h[owner_id] ||= [])
      records << record
    end
  end

  def scope
    fail NotImplementedError
  end

  def records_for(ids)
    ids.flat_map { |id| @records_by_owner[id] }.tap(&:compact!)
  end
end
