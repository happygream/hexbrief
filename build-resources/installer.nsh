!macro customHeader
  !define /redef MUI_WELCOMEPAGE_TITLE "Welcome to HexBrief"
  !define /redef MUI_WELCOMEPAGE_TEXT "Your personal morning dashboard.$\r$\n$\r$\nWeather, tasks, headlines and calendar in one place. No accounts, no tracking."
  !define /redef MUI_FINISHPAGE_TITLE "HexBrief is ready"
  !define /redef MUI_FINISHPAGE_TEXT "Open it each morning for your daily brief."
  !define /redef MUI_FINISHPAGE_RUN "$INSTDIR\HexBrief.exe"
  !define /redef MUI_FINISHPAGE_RUN_TEXT "Launch HexBrief"
!macroend

!macro customInstall
  WriteRegStr HKCU "Software\HexBrief" "InstallPath" "$INSTDIR"
  WriteRegStr HKCU "Software\HexBrief" "Version" "${VERSION}"
!macroend

!macro customUnInstall
  DeleteRegKey HKCU "Software\HexBrief"
!macroend
