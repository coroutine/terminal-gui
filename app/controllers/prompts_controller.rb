class PromptsController < ApplicationController
  
  # ----------------------------------------------
  # Public methods 
  # ----------------------------------------------
  
  # This is the default method for the application.  It establishes the main
  # terminal interface and some default output.
  #
  def index
    session[:current_path] = []
  end

  # This method processes any user inputs and returns the appropriate content for
  # insertion into the display container.
  #
  def create
    cmd       = preprocess_command(params[:terminal][:prompt_offscreen])
    @output   = process_command(cmd).html_safe
    @folder   = file_system_for_current.name
    puts "="*80
    puts @folder
    puts "="*80
  end
  
  
  # ----------------------------------------------
  # Private methods
  # ----------------------------------------------
  private
  
  #================== HELPERS =================================
  
  # This method returns the path to the views in the content folder.
  #
  def template_content(folder = 'content', partial = 'dummy', etx = 'erb')
    render_to_string(:partial => "#{ Rails.root }/app/views/shared/#{ folder }/#{ partial }.html.#{ ext }")
  end
  
  # This method scrubs the user input and breaks it into components.
  #
  def preprocess_command(cmd)
    cmd.gsub!("  ", " ")
    cmd.strip!
    cmd.split(" ");
  end
  
  # This method translates the user command and determines the appropriate sub-function
  # to call.
  #
  def process_command(cmds)
    return "" if cmds.length == 0
    
    s = case cmds[0]
      when "cat"  then run_cat(cmds)
      when "cd"   then run_cd(cmds)
      when "help" then run_help(cmds)
      when "ls"   then run_ls(cmds)
      else "-bash: #{cmds[0]}: command not found"
    end
  end
  
  
  #================== RUNNERS =================================
  
  # This method processes cat requests and returns the appropriate console content
  # as a string.
  #
  def run_cat(cmds = ["cat"])
    folder  = 'content'
    file    = cmds[1] || ""
    
    return "cat: illegal command: File must be specified"   if     file.blank?
    return "cat: illegal command: File paths not supported" unless file.index("/").nil?
    
    begin
      s = IO.read(tempalte_path(folder, file))
    rescue
      s = "cat: #{file}: No such file"
    end
    s
  end
  
  
  # This method processes cd requests and returns the appropriate console content
  # as a string.
  #
  def run_cd(cmds = ["cd"])
    path = cmds[1] || ""
    path.gsub!("\\", "/")            # Fix windows notation
    path.gsub!("//", "/")            # Remove double slashes
    path.gsub!("/./", "/")           # Remove current dir references
    
    is_root_path = false
    if (path[0,1] == "/")
      is_root_path = true
      path = path[1..-1]
    end
    
    nodes   = path.split("/")
    files   = (is_root_path) ? file_system  : file_system_for_current
    current = (is_root_path) ? []           : session[:current_path]
    
    begin
      nodes.each do |n|
        if (n == "..")
          if (files.parent.nil? or files.parent.blank?)
            raise "-bash: cd: #{cmds[1]}: No such file or directory"
          else
            files = files.parent
            current.pop if current.length > 0
          end
        else
          obj = nil
          files.children.each_with_index do |child, index|
            if (child.name == n)
              if (child.type == "file")
                raise "-bash: cd: #{cmds[1]}: Not a directory"
              else
                obj      = child
                current << index
              end
            end
          end
          if obj.nil?
            raise "-bash: cd: #{cmds[1]}: No such file or directory"
          else
            files = obj
          end
        end
      end
      session[:current_path] = current.clone
      s = ""
    rescue => message
      s = message.to_s
    end
    s
  end
  
  
  # This method processes help requests and returns the appropriate console content
  # as a string.
  #
  def run_help(cmds = ["help"])
    folder = 'help'
    file   = cmds[1] || "index"
    begin
      s = IO.read(template_path(folder, file))
    rescue
      s = "-bash: help: no help topics match '#{file}'.  Try 'help help'"
    end
    s
  end
  
    
  # This method processes list requests and returns the appropriate console content
  # as a string.
  #
  def run_ls(cmds = ["ls"])
    begin
      option       = cmds[1] || ""
      if (option == "-l" or option.blank?)
        items   = file_system_for_current.children
        partial = (option == "-l") ? "long" : "short"
        s       = render_to_string(:partial => "shared/ls/#{ partial }", :locals => { :items => items })
      else
        s = "ls: illegal option -- #{option}<br/>usage: ls [-l]"
      end
    rescue
      s = "#{$!}"
    end
  end
  
end
