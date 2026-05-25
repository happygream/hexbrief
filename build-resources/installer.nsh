; HexBrief custom NSIS installer
; NSIS 3.0.4.1 uses /redef not /redefine

!macro customHeader
  !define /redef MUI_WELCOMEPAGE_TITLE "Welcome to HexBrief"
  !define /redef MUI_WELCOMEPAGE_TEXT "HexBrief is your personal morning dashboard.$\r$\n$\r$\nWeather, tasks, headlines and calendar — all in one place. No accounts, no tracking, no subscriptions.$\r$\n$\r$\nClick Next to continue."
  !define /redef MUI_FINISHPAGE_TITLE "HexBrief is ready"
  !define /redef MUI_FINISHPAGE_TEXT "HexBrief has been installed successfully.$\r$\n$\r$\nOpen it each morning for your daily brief."
  !define /redef MUI_FINISHPAGE_RUN "$INSTDIR\HexBrief.exe"
  !define /redef MUI_FINISHPAGE_RUN_TEXT "Launch HexBrief now"
!macroend

!macro customInstall
  WriteRegStr HKCU "Software\HexBrief" "InstallPath" "$INSTDIR"
  WriteRegStr HKCU "Software\HexBrief" "Version" "${VERSION}"
  CreateShortCut "$QUICKLAUNCH\HexBrief.lnk" "$INSTDIR\HexBrief.exe"
!macroend

!macro customUnInstall
  DeleteRegKey HKCU "Software\HexBrief"
  Delete "$QUICKLAUNCH\HexBrief.lnk"
!macroend
