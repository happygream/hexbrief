!macro customInstall
  ; Write registry entries
  WriteRegStr HKCU "Software\HexBrief" "InstallPath" "$INSTDIR"
  WriteRegStr HKCU "Software\HexBrief" "Version" "${VERSION}"

  ; Quick launch shortcut
  CreateShortCut "$QUICKLAUNCH\HexBrief.lnk" "$INSTDIR\HexBrief.exe"
!macroend

!macro customUnInstall
  ; Clean registry on uninstall
  DeleteRegKey HKCU "Software\HexBrief"

  ; Remove quick launch shortcut
  Delete "$QUICKLAUNCH\HexBrief.lnk"
!macroend
