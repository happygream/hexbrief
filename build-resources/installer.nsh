; HexBrief NSIS installer customisation
; Only customInstall and customUnInstall are safe — no customHeader

!macro customInstall
  WriteRegStr HKCU "Software\HexBrief" "InstallPath" "$INSTDIR"
  WriteRegStr HKCU "Software\HexBrief" "Version" "${VERSION}"
  CreateShortCut "$QUICKLAUNCH\HexBrief.lnk" "$INSTDIR\HexBrief.exe"
!macroend

!macro customUnInstall
  DeleteRegKey HKCU "Software\HexBrief"
  Delete "$QUICKLAUNCH\HexBrief.lnk"
!macroend
