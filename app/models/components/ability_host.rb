class AbilityHost
  include Componentize

  # Eager load all the components declared.
  eager_load_components(__dir__)
end
