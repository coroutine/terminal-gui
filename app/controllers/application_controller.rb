class ApplicationController < ActionController::Base
  
  #-------------------------------------------------
  # Configuration
  #-------------------------------------------------

  # define helper settings
  helper  :all
  
  # establish security settings
  protect_from_forgery
  
  
  
  #-------------------------------------------------
  # Private methods
  #-------------------------------------------------
  private
  
  # This method returns a hash containing all the folders and files
  # at and underneath the user's current location
  #
  def file_system_for_current
    files   = file_system
    current = session[:current_path] 
    if (current.length > 0)
      current.each do |i|
        files = files.children[i]
      end
    end
    files
  end
  
  # This method returns a hash containing all the folders and files
  # that comprise the web site's structure
  #
  def file_system
    
    # root item
    root          = FileSystemItem.new("terminal-gui",  "directory",  0,    Time.utc(2009,"jun",27,14,55))
    
    # top-level items
    our_work      = FileSystemItem.new("our_work",      "directory",  0,    Time.utc(2009,"jun",27,14,55))
    our_company   = FileSystemItem.new("our_company",   "directory",  0,    Time.utc(2009,"jun",30,9,9))
    the_crucible  = FileSystemItem.new("the_crucible",  "directory",  0,    Time.utc(2009,"jun",30,9,9))
    blog          = FileSystemItem.new("blog",          "directory",  0,    Time.utc(2009,"jun",30,9,9))
    contact_us    = FileSystemItem.new("contact_us",    "file",       207,  Time.utc(2009,"jun",27,14,49))
    
    # our_work branch
    services      = FileSystemItem.new("services",      "file",       638,  Time.utc(2009,"jun",27,14,55))
    planning      = FileSystemItem.new("planning",      "file",       343,  Time.utc(2009,"jun",27,14,55))
    design        = FileSystemItem.new("design",        "file",       210,  Time.utc(2009,"jun",27,14,55))
    execution     = FileSystemItem.new("execution",     "file",       242,  Time.utc(2009,"jun",27,14,55))
    case_study    = FileSystemItem.new("case_study",    "file",       559,  Time.utc(2009,"jun",27,14,55))
    our_work.add_child(case_study).add_child(design).add_child(execution).add_child(planning).add_child(services)
    
    # our_company branch
    guiding_ideas = FileSystemItem.new("guiding_ideas", "file",       398,  Time.utc(2009,"jun",30,9,9))
    technology    = FileSystemItem.new("technology",    "file",       266,  Time.utc(2009,"jun",30,9,9))
    help_wanted   = FileSystemItem.new("help_wanted",   "file",       249,  Time.utc(2009,"jun",30,9,9))
    principals    = FileSystemItem.new("principals",    "file",       611,  Time.utc(2009,"jun",30,9,9))
    our_company.add_child(guiding_ideas).add_child(help_wanted).add_child(principals).add_child(technology)
    
    # the_crucible branch
    socket_server = FileSystemItem.new("socket_server", "file",       519,  Time.utc(2009,"jun",30,9,9))
    concept_ui    = FileSystemItem.new("concept_ui",    "file",       371,  Time.utc(2009,"jun",30,9,9))
    membrain      = FileSystemItem.new("membrain",      "file",       356,  Time.utc(2009,"jun",30,9,9))
    the_crucible.add_child(concept_ui).add_child(membrain).add_child(socket_server)
    
    # the_crucible branch
    spotlight     = FileSystemItem.new("spotlight",    "file",        100,  Time.utc(2009,"jun",30,9,9))
    new_home      = FileSystemItem.new("new_home",     "file",        356,  Time.utc(2009,"jun",30,9,9))
    blog.add_child(new_home).add_child(spotlight)
    
    # build root from top-level items
    root.add_child(blog).add_child(contact_us).add_child(our_company).add_child(our_work).add_child(the_crucible)
  end
  
end
