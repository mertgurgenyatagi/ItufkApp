import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, Animated, TouchableOpacity, Dimensions, SafeAreaView, Platform, StatusBar as RNStatusBar, ScrollView, TextInput, BackHandler, Alert, Linking } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import * as Font from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import { loginWithPassword, checkAuthStatus, logout, getCurrentUser } from './firebase/authService';
import { getAllUsers } from './firebase/adminService';
import { createEvent, getAllEvents, updateEvent, deleteEvent, subscribeToEvents } from './firebase/eventsService';
import { uploadProfileImage, uploadEventImage } from './firebase/storageService';
import { subscribeToMessages, createMessage, deleteMessage, subscribeToReplies, createReply, deleteReply } from './firebase/messagesService';
import { subscribeToNotifications, createNotification, deleteNotification, markNotificationAsRead, notifyMessageCCUsers, notifyMessageOwnerOfReply, notifyTaggedUsers, notifyEventAnnouncementReminder, notifyWhatsAppAnnouncementReminder, notifyInstagramAnnouncementReminder } from './firebase/notificationsService';
import { registerForPushNotifications, savePushToken, removePushToken, showLocalNotification } from './firebase/pushNotificationsService';
import * as Notifications from 'expo-notifications';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? RNStatusBar.currentHeight : 0;
const HORIZONTAL_PADDING = 20;
const CARD_WIDTH = SCREEN_WIDTH - (HORIZONTAL_PADDING * 2) - (SCREEN_WIDTH * 0.12);
const CARD_GAP = 10;

export default function App() {
  const [showMainPage, setShowMainPage] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard'); // dashboard, notifications, events, tools, messages, settings, calendar, profile, messageDetail, messageCreate, eventCreate, eventDetail, eventEdit
  const [showCaptainOnly, setShowCaptainOnly] = useState(false);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [showTaggedOnly, setShowTaggedOnly] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsDropdownOpen, setNotificationsDropdownOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState(null);
  const [eventCaptain, setEventCaptain] = useState('');
  const [eventBackupCaptain, setEventBackupCaptain] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [eventNameError, setEventNameError] = useState(false);
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);
  const [editEventDate, setEditEventDate] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmDialogData, setConfirmDialogData] = useState({ type: '', message: '' });
  const [showCreateEventPrompt, setShowCreateEventPrompt] = useState(false);
  const [createEventPromptDate, setCreateEventPromptDate] = useState(null);
  const [showCaptainPicker, setShowCaptainPicker] = useState(false);
  const [showCoCaptainPicker, setShowCoCaptainPicker] = useState(false);
  const [showEditCaptainPicker, setShowEditCaptainPicker] = useState(false);
  const [showEditCoCaptainPicker, setShowEditCoCaptainPicker] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showAnnouncementDialog, setShowAnnouncementDialog] = useState(false);
  const [announcementStep, setAnnouncementStep] = useState(1);
  const [showDocumentsDialog, setShowDocumentsDialog] = useState(false);
  const [documentsStep, setDocumentsStep] = useState(1);
  const [eventsData, setEventsData] = useState([]);
  const [editEventName, setEditEventName] = useState('');
  const [editEventTime, setEditEventTime] = useState('');
  const [editEventLocation, setEditEventLocation] = useState('');
  const [editEventText, setEditEventText] = useState('');
  const [editEventCaptain, setEditEventCaptain] = useState('');
  const [editEventCoCaptain, setEditEventCoCaptain] = useState('');
  const [editDriveLink, setEditDriveLink] = useState('');
  const [profileImageUri, setProfileImageUri] = useState(null);
  const [eventImageUri, setEventImageUri] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [ccUsers, setCcUsers] = useState([]);
  const [showCCPicker, setShowCCPicker] = useState(false);
  const [messageTitle, setMessageTitle] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [messagesData, setMessagesData] = useState([]);
  const [repliesData, setRepliesData] = useState([]);
  const [replyContent, setReplyContent] = useState('');
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [mentionCursorPosition, setMentionCursorPosition] = useState(0);
  const [notificationsData, setNotificationsData] = useState([]);
  const [navigationHistory, setNavigationHistory] = useState([{ page: 'dashboard', context: null }]);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [teamsData, setTeamsData] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [showTeamMemberPicker, setShowTeamMemberPicker] = useState(false);
  const [showCompletedReels, setShowCompletedReels] = useState(false);
  // Teneke Film Dağıtımı state (self-contained)
  const [tenekeDistributions, setTenekeDistributions] = useState([]);
  const [selectedDistribution, setSelectedDistribution] = useState(null);
  const [showCreateDistributionModal, setShowCreateDistributionModal] = useState(false);
  const [newDistributionName, setNewDistributionName] = useState('');
  const [showAddIntakeModal, setShowAddIntakeModal] = useState(false);
  const [intakeAmountInput, setIntakeAmountInput] = useState('');
  const [showAddReceiverModal, setShowAddReceiverModal] = useState(false);
  const [receiverNameInput, setReceiverNameInput] = useState('');
  const [receiverAmountInput, setReceiverAmountInput] = useState('');
  // Project Teams (self-contained)
  const [projectTeams, setProjectTeams] = useState([]);
  const [showCreateProjectTeamModal, setShowCreateProjectTeamModal] = useState(false);
  const [newProjectTeamName, setNewProjectTeamName] = useState('');
  const [newProjectTeamDesc, setNewProjectTeamDesc] = useState('');
  const [selectedProjectTeam, setSelectedProjectTeam] = useState(null);
  const [showAddMembersToProjectModal, setShowAddMembersToProjectModal] = useState(false);
  const [projectMemberSelection, setProjectMemberSelection] = useState([]);
  
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const breathingAnim = useRef(new Animated.Value(0.75)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const logoFadeAnim = useRef(new Animated.Value(0)).current;
  const menuSlideAnim = useRef(new Animated.Value(-SCREEN_WIDTH * 0.75)).current;
  const eventEditSaveTimersRef = useRef({});

  useEffect(() => {
    // Load custom fonts
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          'Inter_18pt-Light': require('./assets/fonts/Inter_18pt-Light.ttf'),
          'Inter_18pt-Medium': require('./assets/fonts/Inter_18pt-Medium.ttf'),
          'Inter_18pt-Bold': require('./assets/fonts/Inter_18pt-Bold.ttf'),
          'Inter_18pt-Regular': require('./assets/fonts/Inter_18pt-Regular.ttf'),
        });
      } catch (error) {
        console.error('Error loading fonts', error);
      } finally {
        setFontsLoaded(true);
      }
    };
    
    loadFonts();
  }, []);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (!fontsLoaded) return;
      
      try {
        const user = await checkAuthStatus();
        if (user) {
          setCurrentUser(user);
          setIsAuthenticated(true);
          
          // Load all users for member list and captain selection
          const users = await getAllUsers();
          setAllUsers(users);

          // Register for push notifications and save token
          try {
            const token = await registerForPushNotifications();
            if (token) {
              await savePushToken(user.id, token);
            }
          } catch (e) {
            console.log('Push registration failed:', e?.message);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setCheckingAuth(false);
      }
    };
    
    checkAuth();
  }, [fontsLoaded]);

  // Load events from Firebase with real-time updates
  useEffect(() => {
    if (!isAuthenticated) return;

    // Subscribe to real-time events updates
    const unsubscribe = subscribeToEvents((events) => {
      setEventsData(events);
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  // Load messages from Firebase with real-time updates
  useEffect(() => {
    if (!isAuthenticated) return;

    // Subscribe to real-time messages updates
    const unsubscribe = subscribeToMessages((messages) => {
      setMessagesData(messages);
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  // Load replies when viewing a message detail page
  useEffect(() => {
    if (currentPage === 'messageDetail' && selectedMessage?.id) {
      // Subscribe to real-time replies updates
      const unsubscribe = subscribeToReplies(selectedMessage.id, (replies) => {
        setRepliesData(replies);
      });

      // Auto-insert original poster's tag when opening reply
      if (selectedMessage.sender && selectedMessage.sender !== currentUser?.name) {
        setReplyContent(`@${selectedMessage.sender} `);
      } else {
        setReplyContent('');
      }

      return () => unsubscribe();
    } else {
      setRepliesData([]);
      setReplyContent('');
      setShowMentionSuggestions(false);
    }
  }, [currentPage, selectedMessage, currentUser]);

  // Load notifications from Firebase with real-time updates
  useEffect(() => {
    if (!isAuthenticated || !currentUser?.id) return;

    // Subscribe to real-time notifications updates
    const unsubscribe = subscribeToNotifications(currentUser.id, (notifications) => {
      setNotificationsData(notifications);
    });

    return () => unsubscribe();
  }, [isAuthenticated, currentUser]);

  // Check for event announcement reminders daily at 17:00
  useEffect(() => {
    if (!isAuthenticated || !currentUser?.id || !allUsers.length) return;

    const checkEventReminders = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const event of eventsData) {
        if (event.announced) continue; // Skip if already announced

        const eventDate = event.date ? new Date(event.date) : null;
        if (!eventDate) continue;

        eventDate.setHours(0, 0, 0, 0);
        const daysRemaining = Math.floor((eventDate - today) / (1000 * 60 * 60 * 24));

        // Notify if 1-7 days remaining and not announced
        if (daysRemaining >= 1 && daysRemaining <= 7) {
          const captainUser = allUsers.find(u => u.name === event.captain);
          const coCaptainUser = allUsers.find(u => u.name === event.coCaptain);

          // Only notify if current user is captain or co-captain
          if (captainUser?.id === currentUser.id || coCaptainUser?.id === currentUser.id) {
            // WhatsApp announcement reminder
            if (!event.whatsappAnnounced) {
              await notifyWhatsAppAnnouncementReminder(
                captainUser?.id,
                coCaptainUser?.id,
                { name: event.name, eventId: event.id },
                daysRemaining
              );
            }
            
            // Instagram announcement reminder
            if (!event.instagramAnnounced) {
              await notifyInstagramAnnouncementReminder(
                captainUser?.id,
                coCaptainUser?.id,
                { name: event.name, eventId: event.id },
                daysRemaining
              );
            }
          }
        }
      }
    };

    const scheduleNext17OClockCheck = () => {
      const now = new Date();
      const next17OClock = new Date();
      
      // Set to today at 17:00
      next17OClock.setHours(17, 0, 0, 0);
      
      // If it's already past 17:00 today, schedule for tomorrow
      if (now >= next17OClock) {
        next17OClock.setDate(next17OClock.getDate() + 1);
      }
      
      const msUntil17OClock = next17OClock - now;
      
      console.log(`Next announcement reminder check scheduled for: ${next17OClock.toLocaleString('tr-TR')}`);
      
      return setTimeout(() => {
        console.log('Running 17:00 announcement reminder check...');
        checkEventReminders();
        
        // Schedule the next day's check
        scheduleNext17OClockCheck();
      }, msUntil17OClock);
    };

    // Schedule the first check
    const timeout = scheduleNext17OClockCheck();

    return () => clearTimeout(timeout);
  }, [isAuthenticated, currentUser, eventsData, allUsers]);

  // Initialize edit form fields when navigating to event edit page
  useEffect(() => {
    if (currentPage === 'eventEdit' && selectedEvent) {
      setEditEventName(selectedEvent.name || '');
      setEditEventTime(selectedEvent.time || '');
      setEditEventLocation(selectedEvent.location || '');
      setEditEventText(selectedEvent.text || selectedEvent.description || '');
      setEditEventCaptain(selectedEvent.captain || '');
      setEditEventCoCaptain(selectedEvent.coCaptain || selectedEvent.backupCaptain || '');
      if (selectedEvent.date) {
        setEditEventDate(new Date(selectedEvent.date));
      }
    }
  }, [currentPage, selectedEvent]);

  // Clear message fields when leaving message create page
  useEffect(() => {
    if (currentPage !== 'messageCreate') {
      setCcUsers([]);
      setShowCCPicker(false);
      setMessageTitle('');
      setMessageContent('');
    }
  }, [currentPage]);

  useEffect(() => {
    if (!fontsLoaded) return;
    // Start combined breathing animation (subtle scale + fade)
    const breathingAnimation = Animated.loop(
      Animated.sequence([
        // Scale up and fade in (subtle growth)
        Animated.parallel([
          Animated.timing(breathingAnim, {
            toValue: 1.08,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(logoFadeAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
        // Keep size, fade out
        Animated.timing(logoFadeAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
        // Reset scale for next cycle
        Animated.timing(breathingAnim, {
          toValue: 0.75,
          duration: 100,
          useNativeDriver: true,
        }),
      ])
    );

    breathingAnimation.start();

    // Show main page after 1.5 seconds with fade transition
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setShowMainPage(true);
        fadeAnim.setValue(1);
      });
    }, 1500);

    return () => {
      breathingAnimation.stop();
      clearTimeout(timer);
    };
  }, [fontsLoaded]);

  // Toast notification effect
  useEffect(() => {
    if (showToast) {
      // Fade in
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto-hide after 2 seconds
      const timer = setTimeout(() => {
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setShowToast(false);
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showToast, toastOpacity]);

  // Helper function to show toast
  const showToastNotification = (message) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const toggleMenu = () => {
    const toValue = menuOpen ? -SCREEN_WIDTH * 0.75 : 0;
    Animated.timing(menuSlideAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setMenuOpen(!menuOpen);
  };

  const navigateTo = (page) => {
    setCurrentPage(page);
    toggleMenu();
  };

  // Modern navigation system like Instagram/Facebook
  const navigateToPage = (page, context = null, replace = false) => {
    setCurrentPage(page);
    setMenuOpen(false);
    setSearchOpen(false);
    setNotificationsDropdownOpen(false);
    
    if (replace) {
      // Replace current page (for actions like "save and go back")
      setNavigationHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = { page, context };
        return newHistory;
      });
    } else {
      // Add to navigation history
      setNavigationHistory(prev => [...prev, { page, context }]);
    }
  };

  // Navigate back with proper context handling
  const navigateBack = () => {
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory];
      newHistory.pop(); // Remove current page
      const previousPage = newHistory[newHistory.length - 1];
      
      setNavigationHistory(newHistory);
      setCurrentPage(previousPage.page);
      
      // Handle context restoration
      if (previousPage.context) {
        if (previousPage.context.selectedMessage) {
          setSelectedMessage(previousPage.context.selectedMessage);
        }
        if (previousPage.context.selectedEvent) {
          setSelectedEvent(previousPage.context.selectedEvent);
        }
      }
      
      return true;
    }
    return false;
  };

  // Preferred back destinations for specific pages
  const getPreferredBackTarget = () => {
    if (currentPage === 'eventDetail') return 'events';
    if (currentPage === 'messageDetail') return 'messages';
    if (currentPage === 'teneke') return 'tools';
    if (currentPage === 'reels') return 'tools';
    if (currentPage === 'projectTeams') return 'tools';
    return null;
  };

  // Navigate to root page (dashboard) and clear history
  const navigateToRoot = () => {
    setCurrentPage('dashboard');
    setNavigationHistory([{ page: 'dashboard', context: null }]);
    setSelectedMessage(null);
    setSelectedEvent(null);
  };

  const handleConfirmDialogAction = async () => {
    setShowConfirmDialog(false);
    
    switch (confirmDialogData.type) {
      case 'reelsClaimStep1':
        setConfirmDialogData({ type: 'reelsClaimStep2', message: 'Bak kesin üstleniyor musun? Sonra uğraştırma milleti.' });
        setShowConfirmDialog(true);
        break;
      case 'reelsClaimStep2':
        try {
          if (!currentUser?.id || !pendingReelsEvent?.id) return;
          await updateEvent(pendingReelsEvent.id, {
            reelsAssigneeId: currentUser.id,
            reelsAssigneeName: currentUser.name || currentUser.displayName || 'Bilinmeyen',
            reelsClaimedAt: new Date().toISOString(),
          });
          setEventsData(prev => prev.map(e => e.id === pendingReelsEvent.id ? { ...e, reelsAssigneeId: currentUser.id, reelsAssigneeName: currentUser.name || currentUser.displayName || 'Bilinmeyen', reelsClaimedAt: new Date().toISOString() } : e));
        } catch (error) {
          alert('Sorumluluk üstlenilirken bir hata oluştu');
        }
        break;
      case 'reelsUnclaimStep1':
        setConfirmDialogData({ type: 'reelsUnclaimStep2', message: 'Bak kesin bırakıyor musun? Sonra uğraştırma milleti.' });
        setShowConfirmDialog(true);
        break;
      case 'reelsUnclaimStep2':
        try {
          if (!currentUser?.id || !pendingReelsEvent?.id) return;
          await updateEvent(pendingReelsEvent.id, {
            reelsAssigneeId: null,
            reelsAssigneeName: null,
            reelsClaimedAt: null,
          });
          setEventsData(prev => prev.map(e => e.id === pendingReelsEvent.id ? { ...e, reelsAssigneeId: null, reelsAssigneeName: null, reelsClaimedAt: null } : e));
        } catch (error) {
          alert('Sorumluluk bırakılırken bir hata oluştu');
        }
        break;
      case 'tenekeAddIntake':
        if (selectedDistribution?.id) {
          const amt = Number(confirmDialogData.amount) || 0;
          const item = { id: `in_${Date.now()}`, amount: amt, createdAt: new Date().toISOString() };
          setTenekeDistributions(prev => prev.map(d => d.id === selectedDistribution.id ? { ...d, intakes: [item, ...d.intakes] } : d));
          setSelectedDistribution(prev => prev && prev.id === selectedDistribution.id ? { ...prev, intakes: [item, ...prev.intakes] } : prev);
        }
        break;
      case 'tenekeAddReceiver':
        if (selectedDistribution?.id) {
          const name = confirmDialogData.name;
          const amt = Number(confirmDialogData.amount) || 0;
          const rc = { id: `rc_${Date.now()}`, name, originalAmount: amt, currentAmount: amt, paid: false, createdAt: new Date().toISOString() };
          setTenekeDistributions(prev => prev.map(d => d.id === selectedDistribution.id ? { ...d, receivers: [rc, ...d.receivers] } : d));
          setSelectedDistribution(prev => prev && prev.id === selectedDistribution.id ? { ...prev, receivers: [rc, ...prev.receivers] } : prev);
        }
        break;
      case 'tenekeMarkDone':
        if (selectedDistribution?.id) {
          setTenekeDistributions(prev => prev.map(d => d.id === selectedDistribution.id ? { ...d, done: true } : d));
          setSelectedDistribution(prev => prev && prev.id === selectedDistribution.id ? { ...prev, done: true } : prev);
        }
        break;
      case 'tenekeDeleteDistribution':
        if (confirmDialogData.distId) {
          const id = confirmDialogData.distId;
          setTenekeDistributions(prev => prev.filter(d => d.id !== id));
          if (selectedDistribution?.id === id) {
            setSelectedDistribution(null);
            navigateToPage('teneke');
          }
        }
        break;
      case 'projTeamDelete':
        if (confirmDialogData.teamId) {
          const id = confirmDialogData.teamId;
          setProjectTeams(prev => prev.filter(t => t.id !== id));
          if (selectedProjectTeam?.id === id) {
            setSelectedProjectTeam(null);
            navigateToPage('projectTeams');
          }
        }
        break;
      
      case 'deleteFromEdit':
      case 'deleteFromDetail':
        try {
          if (selectedEvent && selectedEvent.id) {
            await deleteEvent(selectedEvent.id);
            setSelectedEvent(null);
            navigateToPage('events');
          }
        } catch (error) {
          console.error('Delete event error:', error);
          alert('Etkinlik silinirken bir hata oluştu');
        }
        break;
      default:
        break;
    }
  };

  const handleCreateEventFromCalendar = () => {
    setEventDate(createEventPromptDate);
    setShowCreateEventPrompt(false);
    navigateToPage('eventCreate');
  };

  const handleBackPress = () => {
    // Close any open overlays first
    if (menuOpen) {
      setMenuOpen(false);
      return true;
    }
    
    if (notificationsDropdownOpen) {
      setNotificationsDropdownOpen(false);
      return true;
    }
    
    if (searchOpen) {
      setSearchOpen(false);
      return true;
    }
    
    // Handle different page types with proper navigation patterns
    switch (currentPage) {
      case 'messageDetail':
      case 'eventDetail':
      case 'eventEdit':
      case 'messageCreate':
      case 'eventCreate':
        // These are detail/edit pages - go back to previous page
        return navigateBack();
        
      case 'notifications':
      case 'events':
      case 'messages':
      case 'settings':
      case 'calendar':
      case 'profile':
        // These are main sections - go to dashboard
        navigateToRoot();
        return true;
        
      case 'dashboard':
        // Already at root - allow app to exit
        return false;
        
      default:
        // Fallback - try to go back, otherwise go to dashboard
        if (!navigateBack()) {
          navigateToRoot();
          return true;
        }
        return true;
    }
  };

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    
    return () => backHandler.remove();
  }, [currentPage, navigationHistory, menuOpen, notificationsDropdownOpen, searchOpen]);

  // Set up push notification listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    // Listener for notifications received while app is foregrounded
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      // Show local notification when app is in foreground
      showLocalNotification(
        notification.request.content.title,
        notification.request.content.body,
        notification.request.content.data
      );
    });

    // Listener for user tapping on notifications
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
      const data = response.notification.request.content.data;
      
      // Handle navigation based on notification type
      if (data?.type === 'message') {
        setCurrentPage('messageDetail');
        setSelectedMessage({ id: data.messageId });
      } else if (data?.type === 'event') {
        setCurrentPage('eventDetail');
        setSelectedEvent({ id: data.eventId });
      } else if (data?.type === 'notification') {
        setCurrentPage('notifications');
      }
    });

    return () => {
      notificationListener?.remove();
      responseListener?.remove();
    };
  }, [isAuthenticated]);

  const renderPageContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return renderDashboard();
      case 'notifications':
        return renderNotifications();
      case 'events':
        return renderEvents();
      case 'tools':
        return renderTools();
      case 'messages':
        return renderMessages();
      case 'settings':
        return renderSettings();
      case 'calendar':
        return renderCalendar();
      case 'profile':
        return renderProfile();
      case 'messageDetail':
        return renderMessageDetail();
      case 'messageCreate':
        return renderMessageCreate();
      case 'eventCreate':
        return renderEventCreate();
      case 'eventDetail':
        return renderEventDetail();
      case 'eventEdit':
        return renderEventEdit();
      case 'reels':
        return renderReelsUstlenme();
      case 'teneke':
        return renderTenekeFilmDagitimi();
      case 'projectTeams':
        return renderProjectTeams();
      case 'projectTeamDetail':
        return renderProjectTeamDetail();
      case 'tenekeDistribution':
        return renderTenekeDistribution();
      case 'teamCreate':
        return renderTeamCreate();
      case 'teamManagement':
        return renderTeamManagement();
      case 'teamChat':
        return renderTeamChat();
      default:
        return renderDashboard();
    }
  };

  const handleLogin = async () => {
    try {
      setLoginLoading(true);
      setLoginError('');
      
      const userData = await loginWithPassword(loginPassword);
      
      // Login successful
      setCurrentUser(userData);
      setIsAuthenticated(true);
      
      // Load all users for member list and captain selection
      const users = await getAllUsers();
      setAllUsers(users);
      
      setShowMainPage(true);
    } catch (err) {
      setLoginError(err.message || 'Giriş başarısız');
    } finally {
      setLoginLoading(false);
    }
  };

  const renderLogin = () => {
    return (
      <View style={styles.loginContainer}>
        <View style={styles.loginBox}>
          <Image 
            source={require('./assets/itufklogo.png')} 
            style={styles.loginLogo}
          />
          <Text style={styles.loginTitle}>İTÜ Fotoğraf Kulübü</Text>
          <Text style={styles.loginSubtitle}>Yönetim Kurulu Uygulaması</Text>
          
          <TextInput
            style={[styles.loginInput, loginError && styles.loginInputError]}
            placeholder="Şifrenizi girin"
            placeholderTextColor="#999"
            secureTextEntry
            value={loginPassword}
            onChangeText={(text) => {
              setLoginPassword(text);
              setLoginError('');
            }}
            editable={!loginLoading}
          />
          
          {loginError ? (
            <Text style={styles.loginError}>{loginError}</Text>
          ) : null}
          
          <TouchableOpacity 
            style={[styles.loginButton, loginLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loginLoading}
          >
            <Text style={styles.loginButtonText}>
              {loginLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.loginHelp}>
            Şifrenizi hatırlamıyor musunuz?{'\n'}
            Uygulama yöneticisi ile iletişime geçin.
          </Text>
        </View>
      </View>
    );
  };

  const renderDashboard = () => (
    <ScrollView 
      style={styles.dashboardScrollView}
      contentContainerStyle={styles.dashboardContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.dashboardHeader}>
        {(currentUser?.profileImageUrl || profileImageUri) ? (
          <Image 
            source={{ uri: profileImageUri || currentUser?.profileImageUrl }}
            style={styles.profileFrame}
          />
        ) : (
          <View style={styles.profileFrame}>
            <Text style={styles.profileInitial}>
              {currentUser?.name?.charAt(0) || 'U'}
            </Text>
          </View>
        )}
        <View style={styles.welcomeText}>
          <Text style={styles.welcomeMessage}>Hoş geldin 👋</Text>
          <Text style={styles.userName}>{currentUser?.name || 'Kullanıcı'}</Text>
        </View>
      </View>
      <View style={styles.dateSectionRow}>
        <View style={styles.dateSection}>
          <Text style={styles.dateLabel}>Tarih:</Text>
          <Text style={styles.dateValue}>
            {(() => {
              const today = new Date();
              const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
              return `${today.getDate()} ${monthNames[today.getMonth()]} ${today.getFullYear()}`;
            })()}
          </Text>
        </View>
        <TouchableOpacity style={styles.calendarButton} onPress={() => navigateToPage('calendar')}>
          <Text style={styles.calendarButtonText}>Takvime git</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.upcomingEventsSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.upcomingEventsTitle}>Yaklaşan Etkinlikler</Text>
          <TouchableOpacity style={styles.sectionButton} onPress={() => navigateToPage('events')}>
            <Text style={styles.sectionButtonText}>Etkinliklere git</Text>
          </TouchableOpacity>
        </View>
        {(() => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const upcomingEvents = eventsData
            .filter(event => {
              if (!event.date) return false;
              const eventDate = new Date(event.date);
              return eventDate >= today;
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 5);
          
          if (upcomingEvents.length === 0) {
            return (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>Henüz etkinlik yok</Text>
              </View>
            );
          }
          
          return (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 16 }}
            >
              {upcomingEvents.map((event, index) => {
                const eventDate = event.date ? new Date(event.date) : null;
                const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
                const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
                
                return (
                  <TouchableOpacity 
                    key={event.id || index} 
                    style={[
                      styles.eventCard, 
                      { backgroundColor: (event.hasImage || event.imageUrl) ? '#1a1a1a' : '#999' }
                    ]}
                    onPress={() => {
                      setSelectedEvent(event);
                      navigateToPage('eventDetail', { selectedEvent: event });
                    }}
                  >
                    {(event.hasImage || event.imageUrl) && (
                      <>
            <View style={styles.imageWrapper}>
              <Image 
                            source={{ uri: event.imageUrl }} 
                style={styles.eventImage}
              />
            </View>
            <LinearGradient
                          colors={[
                            'rgba(0, 0, 0, 0.7)', 
                            'rgba(0, 0, 0, 0.6)', 
                            'rgba(0, 0, 0, 0.4)', 
                            'rgba(0, 0, 0, 0.2)', 
                            'rgba(0, 0, 0, 0.05)', 
                            'rgba(0, 0, 0, 0)'
                          ]}
              locations={[0, 0.3, 0.5, 0.7, 0.85, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.imageOpacityMask}
            />
                      </>
                    )}
            <View style={styles.eventContent}>
                      <Text style={styles.eventName}>{event.name}</Text>
                      {eventDate && event.time ? (
                        <Text style={styles.eventDateTime}>
                          {eventDate.getDate()} {monthNames[eventDate.getMonth()]} {dayNames[eventDate.getDay()]} • {event.time}
                        </Text>
                      ) : eventDate ? (
                        <Text style={styles.eventDateTime}>
                          {eventDate.getDate()} {monthNames[eventDate.getMonth()]} {dayNames[eventDate.getDay()]}
                        </Text>
                      ) : null}
            </View>
                  </TouchableOpacity>
                );
              })}
        </ScrollView>
          );
        })()}
      </View>
      <View style={styles.messageBoardSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.messageBoardTitle}>Mesaj Panosu</Text>
          <TouchableOpacity style={styles.sectionButton} onPress={() => navigateToPage('messages')}>
            <Text style={styles.sectionButtonText}>Mesaj panosuna git</Text>
          </TouchableOpacity>
        </View>
        {messagesData.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Henüz mesaj yok</Text>
            </View>
        ) : (
          messagesData.slice(0, 3).map((message) => {
            const messageDate = message.createdAt ? new Date(message.createdAt) : new Date();
            const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
            
            return (
        <TouchableOpacity 
                key={message.id}
          style={styles.messageCard}
          onPress={() => {
                  setSelectedMessage(message);
            navigateToPage('messageDetail', { selectedMessage: message });
          }}
        >
          <View style={styles.messageHeader}>
                  <Text style={styles.messageTitle}>{message.title}</Text>
                  <Text style={styles.messageDate}>
                    {getTimeAgo(message.createdAt)}
          </Text>
          </View>
                <Text style={styles.messageSender}>Gönderen: {message.sender}</Text>
                <Text style={styles.messagePreview} numberOfLines={2}>
                  {message.content}
          </Text>
        </TouchableOpacity>
            );
          })
        )}
      </View>
    </ScrollView>
  );

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
    }

    // Navigate based on type
    if (notification.relatedType === 'message' && notification.relatedId) {
      const message = messagesData.find(m => m.id === notification.relatedId);
      if (message) {
        setSelectedMessage(message);
        navigateToPage('messageDetail', { selectedMessage: message });
      }
    } else if (notification.relatedType === 'event' && notification.relatedId) {
      const event = eventsData.find(e => e.id === notification.relatedId);
      if (event) {
        setSelectedEvent(event);
        navigateToPage('eventDetail', { selectedEvent: event });
      }
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const renderNotifications = () => (
    <ScrollView 
      style={styles.dashboardScrollView}
      contentContainerStyle={styles.dashboardContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.pageTitle}>Bildirimler</Text>
      
      {notificationsData.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Henüz bildirim yok</Text>
        </View>
      ) : (
        notificationsData.map((notification) => (
          <TouchableOpacity
            key={notification.id}
            style={[
              styles.notificationCard,
              !notification.read && styles.notificationCardUnread
            ]}
            onPress={() => handleNotificationClick(notification)}
          >
            <View style={styles.notificationContent}>
              <View style={styles.notificationHeader}>
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                <TouchableOpacity 
                  onPress={() => handleDeleteNotification(notification.id)}
                  style={styles.deleteNotificationButton}
                >
                  <Image source={require('./assets/delete.png')} style={styles.deleteNotificationIcon} />
      </TouchableOpacity>
        </View>
              <Text style={styles.notificationMessage}>{notification.message}</Text>
              <Text style={styles.notificationDate}>{getTimeAgo(notification.createdAt)}</Text>
        </View>
            {!notification.read && <View style={styles.notificationUnreadDot} />}
      </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );

  const renderEvents = () => {
    return (
      <ScrollView 
        style={styles.dashboardScrollView}
        contentContainerStyle={styles.dashboardContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageHeaderRow}>
          <Text style={styles.pageTitle}>Etkinlikler</Text>
        </View>
        <TouchableOpacity 
          style={[styles.createButton, styles.createButtonUnderTitle]}
          onPress={() => navigateToPage('eventCreate')}
        >
          <Image source={require('./assets/add.png')} style={styles.createButtonIcon} />
          <Text style={styles.createButtonText}>Etkinlik oluştur</Text>
        </TouchableOpacity>
        
        {/* Filter Buttons */}
        <View style={styles.filterRow}>
          <TouchableOpacity 
            style={[styles.filterButton, showCaptainOnly && styles.filterButtonActive]}
            onPress={() => setShowCaptainOnly(!showCaptainOnly)}
          >
            <Text style={[styles.filterButtonText, showCaptainOnly && styles.filterButtonTextActive]}>
              Kaptan olunan
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, showPastEvents && styles.filterButtonActive]}
            onPress={() => setShowPastEvents(!showPastEvents)}
          >
            <Text style={[styles.filterButtonText, showPastEvents && styles.filterButtonTextActive]}>
              Geçmiş etkinlikleri de göster
            </Text>
          </TouchableOpacity>
        </View>

        {/* Event Cards */}
        {eventsData
          .sort((a, b) => {
            // Sort by date chronologically (earliest first)
            const dateA = a.date ? new Date(a.date) : new Date('9999-12-31');
            const dateB = b.date ? new Date(b.date) : new Date('9999-12-31');
            return dateA - dateB;
          })
          .map((event) => {
          const eventDate = event.date ? new Date(event.date) : null;
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
          const isPastEvent = eventDate ? eventDate < today : false;
          
          // Filter out past events if showPastEvents is false
          if (isPastEvent && !showPastEvents) {
            return null;
          }
          
          // Filter by captain/co-captain if active
          if (showCaptainOnly) {
            const isCaptain = event.captain === currentUser?.name;
            const isCoCaptain = event.coCaptain === currentUser?.name;
            if (!isCaptain && !isCoCaptain) {
              return null;
            }
          }
          
          const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
          const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
          
          return (
            <TouchableOpacity 
              key={event.id}
              style={[
                styles.eventCardLarge, 
                { backgroundColor: (event.hasImage || event.imageUrl) ? '#1a1a1a' : '#999' },
                // past-event dimming handled inside content to keep tags full opacity
              ]}
              onPress={() => {
                setSelectedEvent(event);
                navigateToPage('eventDetail', { selectedEvent: event });
              }}
            >
              {(event.hasImage || event.imageUrl) && (
                <>
          <View style={styles.imageWrapper}>
            <Image 
                      source={{ uri: event.imageUrl }} 
              style={styles.eventImage}
            />
          </View>
          <LinearGradient
                          colors={[
                            'rgba(0, 0, 0, 0.7)', 
                            'rgba(0, 0, 0, 0.6)', 
                            'rgba(0, 0, 0, 0.4)', 
                            'rgba(0, 0, 0, 0.2)', 
                            'rgba(0, 0, 0, 0.05)', 
                            'rgba(0, 0, 0, 0)'
                          ]}
            locations={[0, 0.3, 0.5, 0.7, 0.85, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.imageOpacityMask}
          />
                </>
              )}

          <View style={styles.eventContentLarge}>
                <View>
                <Text style={styles.eventNameLarge}>{event.name}</Text>
                {eventDate && event.time ? (
                  <Text style={styles.eventDateTime}>
                    {eventDate.getDate()} {monthNames[eventDate.getMonth()]} {dayNames[eventDate.getDay()]} • {event.time}
                  </Text>
                ) : eventDate ? (
                  <Text style={styles.eventDateTime}>
                    {eventDate.getDate()} {monthNames[eventDate.getMonth()]} {dayNames[eventDate.getDay()]}
                  </Text>
                ) : (
                  <Text style={styles.eventDateTime}>Tarih belirlenmedi</Text>
                )}
                
                {/* Captain tags moved into tags grid below */}
                </View>
                {/* New Status Tags */}
                {(() => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const eventDate = event.date ? new Date(event.date) : null;
                  if (!eventDate) return null;
                  
                  const daysUntilEvent = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
                  const daysAfterEvent = Math.ceil((today - eventDate) / (1000 * 60 * 60 * 24));
                  
                  const tags = [];
                  // Captain/co-captain tags (for current user)
                  if (event.captain === currentUser?.name) {
                    tags.push(
                      <View key="captain" style={[styles.tagTile, styles.announcementBadgeInline]}>
                        <Text style={styles.announcementBadgeInlineText}>Kaptansın! ⚡</Text>
                      </View>
                    );
                  } else if (event.coCaptain === currentUser?.name) {
                    tags.push(
                      <View key="coCaptain" style={[styles.tagTile, styles.announcementBadgeInline]}>
                        <Text style={styles.announcementBadgeInlineText}>Yedek kaptansın 🔄</Text>
                      </View>
                    );
                  }
                  
                  // WhatsApp announcement tag (7 days or fewer until event)
                  if (daysUntilEvent >= 0 && daysUntilEvent <= 7 && !event.whatsappAnnounced) {
                    tags.push(
                      <View key="whatsapp" style={[styles.tagTile, styles.announcementBadgeWarningInline]}>
                        <Text style={styles.announcementBadgeWarningInlineText}>⚠ WhatsApp</Text>
                      </View>
                    );
                  }
                  
                  // Instagram announcement tag (7 days or fewer until event)
                  if (daysUntilEvent >= 0 && daysUntilEvent <= 7 && !event.instagramAnnounced) {
                    tags.push(
                      <View key="instagram" style={[styles.tagTile, styles.announcementBadgeWarningInline]}>
                        <Text style={styles.announcementBadgeWarningInlineText}>⚠ Instagram</Text>
                      </View>
                    );
                  }
                  
                  // Reels post tag (1 day after event until posted)
                  if (daysAfterEvent >= 1 && !event.reelsPosted) {
                    tags.push(
                      <View key="reels" style={[styles.tagTile, styles.announcementBadgeWarningInline]}>
                        <Text style={styles.announcementBadgeWarningInlineText}>⚠ Reels</Text>
                      </View>
                    );
                  }
                  
                  // Documents tag (perpetuity until 1 day after event or provided)
                  if ((daysUntilEvent >= 0 || daysAfterEvent <= 1) && !event.documentsSubmitted) {
                    tags.push(
                      <View key="documents" style={[styles.tagTile, styles.announcementBadgeWarningInline]}>
                        <Text style={styles.announcementBadgeWarningInlineText}>⚠ Belgeler</Text>
                      </View>
                    );
                  }
                  
                  if (tags.length === 0) return null;
                  return (
                    <View style={styles.tagsGrid}>
                      {tags}
                    </View>
                  );
                })()}
          </View>
        </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  const renderMessages = () => {
    return (
      <ScrollView 
        style={styles.dashboardScrollView}
        contentContainerStyle={styles.dashboardContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageHeaderRow}>
          <Text style={styles.pageTitle}>Mesaj Panosu</Text>
        </View>
        <TouchableOpacity 
          style={[styles.createButton, styles.createButtonUnderTitle]}
          onPress={() => navigateToPage('messageCreate')}
        >
          <Image source={require('./assets/add.png')} style={styles.createButtonIcon} />
          <Text style={styles.createButtonText}>Mesaj oluştur</Text>
        </TouchableOpacity>
        
        {messagesData.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Henüz mesaj yok</Text>
        </View>
        ) : (
          messagesData.map((message) => {
            const messageDate = message.createdAt ? new Date(message.createdAt) : new Date();
            const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
            const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
            const senderUser = allUsers.find(u => u.name === message.sender);
            
            return (
          <TouchableOpacity 
                key={message.id}
          style={styles.messageCard}
          onPress={() => {
                  setSelectedMessage(message);
            navigateToPage('messageDetail', { selectedMessage: message });
          }}
        >
                <View style={styles.messageCardRow}>
                  {senderUser?.profileImageUrl ? (
                    <Image source={{ uri: senderUser.profileImageUrl }} style={styles.messageAvatarImage} />
                  ) : (
                    <View style={[styles.messageAvatar, { backgroundColor: getAvatarColor(message.sender) }]}>
                      <Text style={styles.messageAvatarInitial}>{message.sender?.charAt(0) || '?'}</Text>
            </View>
                  )}
                  <View style={styles.messageCardContent}>
          <View style={styles.messageHeader}>
                      <Text style={styles.messageTitle}>{message.title}</Text>
                      <Text style={styles.messageDate}>
                        {getTimeAgo(message.createdAt)}
            </Text>
            </View>
                    <Text style={styles.messageSender}>Gönderen: {message.sender}</Text>
                    <Text style={styles.messagePreview} numberOfLines={2}>
                      {message.content}
          </Text>
                    {message.ccUsers && message.ccUsers.length > 0 && (
                      <Text style={styles.messageCc}>
                        CC: {message.ccUsers.join(', ')}
          </Text>
                    )}
              </View>
            </View>
          </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    );
  };

  const renderSettings = () => {
    return (
      <ScrollView 
        style={styles.dashboardScrollView}
        contentContainerStyle={styles.dashboardContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Seçenekler</Text>
        
        <View style={styles.settingsSection}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Gereksiz Buton</Text>
              <Text style={styles.settingDescription}>Hiçbir şey yapmayan bir buton</Text>
          </View>
          <TouchableOpacity 
              style={[styles.toggle, darkMode && styles.toggleActive]}
              onPress={() => setDarkMode(!darkMode)}
          >
              <View style={[styles.toggleThumb, darkMode && styles.toggleThumbActive]} />
          </TouchableOpacity>
        </View>
        </View>
      </ScrollView>
    );
  };

  const renderTools = () => {
    return (
      <ScrollView 
        style={styles.dashboardScrollView}
        contentContainerStyle={styles.dashboardContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageHeaderRow}>
          <Text style={styles.pageTitle}>Araçlar</Text>
        </View>

        <View style={styles.toolsGrid}>
          <TouchableOpacity style={[styles.toolNavCard, { backgroundColor: '#7A0E0E', borderColor: '#7A0E0E' }]} onPress={() => navigateToPage('reels')}>
            <Image source={require('./assets/reels_ustlenme.png')} style={[styles.toolNavIcon, { tintColor: '#fff' }]} />
            <Text style={[styles.toolNavLabel, { color: '#fff' }]}>Reels Üstlenme</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.toolNavCard, { backgroundColor: '#0f0f0f', borderColor: '#0f0f0f' }]} onPress={() => navigateToPage('teneke')}>
            <Image source={require('./assets/teneke_film_dagitimi.png')} style={[styles.toolNavIcon, { tintColor: '#fff' }]} />
            <Text style={[styles.toolNavLabel, { color: '#fff' }]}>Teneke Film Dağıtımı</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.toolNavCard, { backgroundColor: '#0E2A7A', borderColor: '#0E2A7A' }]} onPress={() => navigateToPage('projectTeams')}>
            <Image source={require('./assets/proje_takimlari.png')} style={[styles.toolNavIcon, { tintColor: '#fff' }]} />
            <Text style={[styles.toolNavLabel, { color: '#fff' }]}>Proje Takımları</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const [pendingReelsEvent, setPendingReelsEvent] = useState(null);
  const renderReelsUstlenme = () => {
    const handleClaim = (event) => {
      setPendingReelsEvent(event);
      setConfirmDialogData({ type: 'reelsClaimStep1', message: 'Bu etkinliğin Reels sorumluluğunu üstlenmek istediğine emin misin?' });
      setShowConfirmDialog(true);
    };

    const handleUnclaim = (event) => {
      setPendingReelsEvent(event);
      setConfirmDialogData({ type: 'reelsUnclaimStep1', message: 'Bu etkinlik için Reels sorumluluğunu bırakmak istediğine emin misin?' });
      setShowConfirmDialog(true);
    };

    const filtered = eventsData
      .filter(ev => showCompletedReels ? true : !ev.reelsPosted)
      .sort((a, b) => {
        const da = a.date ? new Date(a.date).getTime() : 0;
        const db = b.date ? new Date(b.date).getTime() : 0;
        return da - db;
      });

    return (
      <ScrollView 
        style={styles.dashboardScrollView}
        contentContainerStyle={styles.dashboardContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageHeaderRow}>
          <Text style={styles.pageTitle}>Reels Üstlenme</Text>
        </View>

        <View style={styles.filterRow}>
        <TouchableOpacity 
            style={[styles.filterButton, showCompletedReels && styles.filterButtonActive]}
            onPress={() => setShowCompletedReels(!showCompletedReels)}
          >
            <Text style={[styles.filterButtonText, showCompletedReels && styles.filterButtonTextActive]}>
              Tamamlananları göster
            </Text>
        </TouchableOpacity>
        </View>
        
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Gösterilecek etkinlik yok</Text>
          </View>
        ) : (
          filtered.map((ev) => {
            const assigneeName = ev.reelsAssigneeName;
            const isMine = ev.reelsAssigneeId && ev.reelsAssigneeId === currentUser?.id;
            return (
              <View key={ev.id} style={[styles.reelsItemCard, ev.reelsAssigneeId ? styles.reelsItemCardClaimed : null]}>
                <View style={styles.reelsItemInfo}>
                  <Text style={styles.reelsItemTitle}>{ev.name}</Text>
                  <Text style={styles.reelsItemSubtitle}>
                    {assigneeName ? `Sorumlu: ${assigneeName}` : 'Sorumlu yok'}
                    {ev.reelsPosted ? ' • Paylaşıldı' : ''}
                  </Text>
                </View>
                {assigneeName ? (
                  isMine ? (
                    <TouchableOpacity style={[styles.reelsActionButton, styles.reelsUnclaim]} onPress={() => handleUnclaim(ev)}>
                      <Text style={styles.reelsActionText}>Bırak</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.reelsTakenBadge}>
                      <Text style={styles.reelsTakenText}>Üstlenildi</Text>
                    </View>
                  )
                ) : (
                  <TouchableOpacity style={[styles.reelsActionButton, styles.reelsClaim]} onPress={() => handleClaim(ev)}>
                    <Text style={styles.reelsActionText}>Üstlen</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    );
  };

  const renderTenekeFilmDagitimi = () => {
    const handleCreateDistribution = () => {
      setNewDistributionName('');
      setShowCreateDistributionModal(true);
    };

    const confirmCreateDistribution = () => {
      const name = newDistributionName.trim();
      if (!name) {
        setShowCreateDistributionModal(false);
        return;
      }
      const newDist = {
        id: `dist_${Date.now()}`,
        name,
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.name || currentUser?.displayName || null,
        intakes: [], // [{id, amount, createdAt}]
        receivers: [], // [{id, name, originalAmount, currentAmount, createdAt}]
        done: false,
      };
      setTenekeDistributions(prev => [newDist, ...prev]);
      setShowCreateDistributionModal(false);
    };
            
            return (
      <ScrollView 
        style={styles.dashboardScrollView}
        contentContainerStyle={styles.dashboardContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageHeaderRow}>
          <Text style={styles.pageTitle}>Teneke Film Dağıtımı</Text>
        </View>
        <TouchableOpacity style={[styles.createButton, styles.createButtonUnderTitle]} onPress={handleCreateDistribution}>
          <Image source={require('./assets/add.png')} style={styles.createButtonIcon} />
          <Text style={styles.createButtonText}>Dağıtım Oluştur</Text>
        </TouchableOpacity>

        {tenekeDistributions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Henüz dağıtım yok</Text>
          </View>
        ) : (
          tenekeDistributions.map(dist => (
            <View key={dist.id} style={styles.distCard}>
        <TouchableOpacity 
                style={{ flex: 1 }}
          onPress={() => {
                  setSelectedDistribution(dist);
                  navigateToPage('tenekeDistribution', { selectedDistribution: dist });
                }}
              >
                <View style={styles.distCardInfo}>
                  <Text style={styles.distCardTitle}>{dist.name}</Text>
                  <Text style={styles.distCardSubtitle}>{new Date(dist.createdAt).toLocaleDateString('tr-TR')}</Text>
            </View>
              </TouchableOpacity>
              {dist.done && (
                <View style={styles.distDoneBadge}><Text style={styles.distDoneText}>Tamamlandı</Text></View>
              )}
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => {
                  setConfirmDialogData({ type: 'tenekeDeleteDistribution', distId: dist.id, message: 'Bu dağıtımı silmek istediğine emin misin?' });
                  setShowConfirmDialog(true);
                }}
              >
                <Image source={require('./assets/delete.png')} style={styles.deleteIcon} />
              </TouchableOpacity>
            </View>
          ))
        )}

        {showCreateDistributionModal && (
          <View style={styles.confirmDialogOverlay}>
            <View style={styles.confirmDialogBox}>
              <Text style={styles.confirmDialogTitle}>Dağıtım Oluştur</Text>
              <TextInput
                style={[styles.textInput, { marginTop: 10 }]}
                value={newDistributionName}
                onChangeText={setNewDistributionName}
                placeholder="Dağıtım adı"
                placeholderTextColor="#999"
              />
              <View style={styles.confirmDialogButtons}>
                <TouchableOpacity 
                  style={styles.confirmDialogButtonCancel}
                  onPress={() => setShowCreateDistributionModal(false)}
                >
                  <Text style={styles.confirmDialogButtonCancelText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.confirmDialogButtonConfirm}
                  onPress={confirmCreateDistribution}
                >
                  <Text style={styles.confirmDialogButtonConfirmText}>Oluştur</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderProjectTeams = () => {
    const truncateWords = (text, maxWords = 20) => {
      if (!text) return '';
      const words = text.split(/\s+/);
      if (words.length <= maxWords) return text;
      return words.slice(0, maxWords).join(' ') + '…';
    };

    const handleCreateTeam = () => {
      setNewProjectTeamName('');
      setNewProjectTeamDesc('');
      setShowCreateProjectTeamModal(true);
    };

    const confirmCreateTeam = () => {
      const name = newProjectTeamName.trim();
      const desc = newProjectTeamDesc.trim();
      setShowCreateProjectTeamModal(false);
      if (!name) return;
      const team = {
        id: `pt_${Date.now()}`,
        name,
        description: desc,
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.id || 'anon',
        members: [currentUser?.id].filter(Boolean),
      };
      setProjectTeams(prev => [team, ...prev]);
    };

    const renderMemberSummary = (team) => {
      const names = (team.members || []).slice(0, 3).map(uid => allUsers.find(u => u.id === uid)?.name || '—');
      const moreCount = Math.max(0, (team.members?.length || 0) - 3);
      return `${names.join(', ')}${moreCount > 0 ? ` ve ${moreCount}+` : ''}`;
    };

    return (
      <ScrollView 
        style={styles.dashboardScrollView}
        contentContainerStyle={styles.dashboardContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageHeaderRow}>
          <Text style={styles.pageTitle}>Proje Takımları</Text>
        </View>
        <TouchableOpacity style={[styles.createButton, styles.createButtonUnderTitle]} onPress={handleCreateTeam}>
          <Image source={require('./assets/team-create.png')} style={styles.createButtonIcon} />
          <Text style={styles.createButtonText}>Takım oluştur</Text>
        </TouchableOpacity>

        {projectTeams.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Henüz proje takımı yok</Text>
          </View>
        ) : (
          projectTeams.map(pt => {
            const isCreator = pt.createdBy === currentUser?.id;
            return (
              <View key={pt.id} style={styles.distCard}>
                <TouchableOpacity 
                  style={{ flex: 1 }}
                  onPress={() => { setSelectedProjectTeam(pt); navigateToPage('projectTeamDetail', { selectedProjectTeam: pt }); }}
                >
                  <View style={styles.distCardInfo}>
                    <Text style={styles.distCardTitle}>{pt.name}</Text>
                    <Text style={styles.distCardSubtitle}>{truncateWords(pt.description, 20)}</Text>
                    <Text style={styles.distCardSubtitle}>{renderMemberSummary(pt)}</Text>
                  </View>
                </TouchableOpacity>
                  {isCreator && (
                    <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => { setConfirmDialogData({ type: 'projTeamDelete', teamId: pt.id, message: 'Bu proje takımını silmek istediğine emin misin?' }); setShowConfirmDialog(true); }}
                  >
                    <Image source={require('./assets/delete.png')} style={styles.deleteIcon} />
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}

        {showCreateProjectTeamModal && (
          <View style={styles.confirmDialogOverlay}>
            <View style={styles.confirmDialogBox}>
              <Text style={styles.confirmDialogTitle}>Proje Takımı Oluştur</Text>
              <TextInput style={[styles.textInput, { marginTop: 10 }]} value={newProjectTeamName} onChangeText={setNewProjectTeamName} placeholder="Takım adı" placeholderTextColor="#999" />
              <TextInput style={[styles.textInput, { marginTop: 10 }]} value={newProjectTeamDesc} onChangeText={setNewProjectTeamDesc} placeholder="Açıklama" placeholderTextColor="#999" />
              <View style={styles.confirmDialogButtons}>
                <TouchableOpacity style={styles.confirmDialogButtonCancel} onPress={() => setShowCreateProjectTeamModal(false)}>
                  <Text style={styles.confirmDialogButtonCancelText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmDialogButtonConfirm} onPress={confirmCreateTeam}>
                  <Text style={styles.confirmDialogButtonConfirmText}>Oluştur</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderTenekeDistribution = () => {
    const ctxDist = navigationHistory[navigationHistory.length - 1]?.context?.selectedDistribution;
    const currentDistId = selectedDistribution?.id || ctxDist?.id;
    const dist = (currentDistId && tenekeDistributions.find(d => d.id === currentDistId)) || selectedDistribution || ctxDist;
    if (!dist) return null;

    const recalc = (d) => {
      const rolled = d.intakes.reduce((s, i) => s + (Number(i.amount) || 0), 0);
      const given = d.receivers.reduce((s, r) => s + (Number(r.currentAmount) || 0), 0);
      const atHand = rolled - given;
      return { rolled, given, atHand };
    };

    const updateDistById = (id, updater) => {
      setTenekeDistributions(prev => prev.map(x => x.id === id ? updater({ ...x }) : x));
      setSelectedDistribution(prev => prev && prev.id === id ? updater({ ...prev }) : prev);
    };

    const handleAddIntake = () => {
      setIntakeAmountInput('');
      setShowAddIntakeModal(true);
    };

    const confirmAddIntake = () => {
      const amt = Math.max(0, Math.floor(Number(intakeAmountInput)) || 0);
      setShowAddIntakeModal(false);
      if (amt <= 0) return;
      setConfirmDialogData({ type: 'tenekeAddIntake', amount: amt, message: `Stoka ${amt} rulo eklemek istediğine emin misin?` });
      setShowConfirmDialog(true);
    };

    const handleAddReceiver = () => {
      setReceiverNameInput('');
      setReceiverAmountInput('');
      setShowAddReceiverModal(true);
    };

    const confirmAddReceiver = () => {
      const name = receiverNameInput.trim();
      const amt = Math.max(0, Math.floor(Number(receiverAmountInput)) || 0);
      setShowAddReceiverModal(false);
      if (!name || amt <= 0) return;
      setConfirmDialogData({ type: 'tenekeAddReceiver', name, amount: amt, message: `${name} için ${amt} rulo eklemek istediğine emin misin?` });
      setShowConfirmDialog(true);
    };

    const handleMarkDone = () => {
      setConfirmDialogData({ type: 'tenekeMarkDone', message: 'Bu dağıtımı tamamlandı olarak işaretlemek istediğine emin misin?' });
      setShowConfirmDialog(true);
    };

    const { rolled, given, atHand } = recalc(dist);

    return (
      <ScrollView 
        style={styles.dashboardScrollView}
        contentContainerStyle={styles.dashboardContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageHeaderRow}>
          <Text style={styles.pageTitle}>{dist.name}</Text>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => {
              setConfirmDialogData({ type: 'tenekeDeleteDistribution', distId: dist.id, message: 'Bu dağıtımı silmek istediğine emin misin?' });
              setShowConfirmDialog(true);
            }}
          >
            <Image source={require('./assets/delete.png')} style={styles.deleteIcon} />
                    </TouchableOpacity>
        </View>

        <View style={styles.counterRow}>
          <View style={styles.counterCard}>
            <Text style={styles.counterLabel}>Eldeki</Text>
            <Text style={styles.counterValue}>{atHand}</Text>
          </View>
          <View style={styles.counterCard}>
            <Text style={styles.counterLabel}>Toplanan</Text>
            <Text style={styles.counterValue}>{rolled}</Text>
          </View>
          <View style={styles.counterCard}>
            <Text style={styles.counterLabel}>Verilen</Text>
            <Text style={styles.counterValue}>{given}</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.smallActionButton} onPress={handleAddIntake}>
            <Text style={styles.smallActionText}>Stok Ekle</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallActionButton} onPress={handleAddReceiver}>
            <Text style={styles.smallActionText}>Alıcı Ekle</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.smallActionButton, styles.smallActionWarn]} onPress={handleMarkDone}>
            <Text style={[styles.smallActionText, styles.smallActionWarnText]}>Tamamlandı</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Stok Girişleri</Text>
        {dist.intakes.length === 0 ? (
          <View style={styles.emptyState}><Text style={styles.emptyStateText}>Kayıt yok</Text></View>
        ) : (
          dist.intakes.map(it => (
            <View key={it.id} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>+{it.amount} rulo</Text>
                <Text style={styles.itemSubtitle}>{new Date(it.createdAt).toLocaleDateString('tr-TR')}</Text>
              </View>
              <TouchableOpacity style={styles.deleteButton} onPress={() => {
                updateDistById(dist.id, d => ({ ...d, intakes: d.intakes.filter(x => x.id !== it.id) }));
              }}>
                <Image source={require('./assets/delete.png')} style={styles.deleteIcon} />
              </TouchableOpacity>
            </View>
          ))
        )}

        <Text style={styles.sectionTitle}>Alıcılar</Text>
        {dist.receivers.length === 0 ? (
          <View style={styles.emptyState}><Text style={styles.emptyStateText}>Kayıt yok</Text></View>
        ) : (
          dist.receivers.map(rc => {
            const minusDisabled = rc.currentAmount <= 0;
            const plusDisabled = rc.currentAmount >= rc.originalAmount;
            return (
              <View key={rc.id} style={styles.receiverRow}>
                <View style={styles.receiverMain}>
                  <Text style={styles.receiverName}>{rc.name} <Text style={styles.receiverNote}>({rc.originalAmount})</Text></Text>
                  <View style={styles.receiverControls}>
                    <TouchableOpacity
                      onPress={() => updateDistById(dist.id, d => ({ ...d, receivers: d.receivers.map(x => x.id === rc.id ? { ...x, currentAmount: Math.max(0, x.currentAmount - 1) } : x) }))}
                      disabled={minusDisabled}
                      style={[styles.circleButton, minusDisabled && styles.circleButtonDisabled]}
                    >
                      <Text style={styles.circleButtonText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.receiverAmount}>{rc.currentAmount}</Text>
                    <TouchableOpacity
                      onPress={() => updateDistById(dist.id, d => ({ ...d, receivers: d.receivers.map(x => x.id === rc.id ? { ...x, currentAmount: Math.min(x.originalAmount, x.currentAmount + 1) } : x) }))}
                      disabled={plusDisabled}
                      style={[styles.circleButton, plusDisabled && styles.circleButtonDisabled]}
                    >
                      <Text style={styles.circleButtonText}>+</Text>
                    </TouchableOpacity>
              </View>
                </View>
                <TouchableOpacity 
                  style={styles.paidToggle}
                  onPress={() => updateDistById(dist.id, d => ({ ...d, receivers: d.receivers.map(x => x.id === rc.id ? { ...x, paid: !x.paid } : x) }))}
                >
                  <Text style={styles.paidToggleText}>{rc.paid ? '☑' : '☐'} Ödeme yaptı</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => {
                  updateDistById(dist.id, d => ({ ...d, receivers: d.receivers.filter(x => x.id !== rc.id) }));
                }}>
                  <Image source={require('./assets/delete.png')} style={styles.deleteIcon} />
                </TouchableOpacity>
              </View>
            );
          })
        )}

        {showAddIntakeModal && (
          <View style={styles.confirmDialogOverlay}>
            <View style={styles.confirmDialogBox}>
              <Text style={styles.confirmDialogTitle}>Stok Ekle</Text>
              <TextInput
                style={[styles.textInput, { marginTop: 10 }]}
                keyboardType="number-pad"
                value={intakeAmountInput}
                onChangeText={setIntakeAmountInput}
                placeholder="Rulo sayısı"
                placeholderTextColor="#999"
              />
              <View style={styles.confirmDialogButtons}>
                <TouchableOpacity style={styles.confirmDialogButtonCancel} onPress={() => setShowAddIntakeModal(false)}>
                  <Text style={styles.confirmDialogButtonCancelText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmDialogButtonConfirm} onPress={confirmAddIntake}>
                  <Text style={styles.confirmDialogButtonConfirmText}>Ekle</Text>
                </TouchableOpacity>
            </View>
            </View>
          </View>
                    )}

        {showAddReceiverModal && (
          <View style={styles.confirmDialogOverlay}>
            <View style={styles.confirmDialogBox}>
              <Text style={styles.confirmDialogTitle}>Alıcı Ekle</Text>
              <TextInput
                style={[styles.textInput, { marginTop: 10 }]}
                value={receiverNameInput}
                onChangeText={setReceiverNameInput}
                placeholder="İsim"
                placeholderTextColor="#999"
              />
              <TextInput
                style={[styles.textInput, { marginTop: 10 }]}
                keyboardType="number-pad"
                value={receiverAmountInput}
                onChangeText={setReceiverAmountInput}
                placeholder="Rulo sayısı"
                placeholderTextColor="#999"
              />
              <View style={styles.confirmDialogButtons}>
                <TouchableOpacity style={styles.confirmDialogButtonCancel} onPress={() => setShowAddReceiverModal(false)}>
                  <Text style={styles.confirmDialogButtonCancelText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmDialogButtonConfirm} onPress={confirmAddReceiver}>
                  <Text style={styles.confirmDialogButtonConfirmText}>Ekle</Text>
                </TouchableOpacity>
              </View>
            </View>
                      </View>
        )}
      </ScrollView>
    );
  };

  const renderProjectTeamDetail = () => {
    const ctx = navigationHistory[navigationHistory.length - 1]?.context?.selectedProjectTeam;
    const teamId = selectedProjectTeam?.id || ctx?.id;
    const team = (teamId && projectTeams.find(t => t.id === teamId)) || selectedProjectTeam || ctx;
    if (!team) return null;

    const isCreator = team.createdBy === currentUser?.id;
    const isMember = (team.members || []).includes(currentUser?.id);

    const updateTeam = (id, updater) => {
      setProjectTeams(prev => prev.map(t => t.id === id ? updater({ ...t }) : t));
      setSelectedProjectTeam(prev => prev && prev.id === id ? updater({ ...prev }) : prev);
    };

    const handleDeleteTeam = () => {
      if (!isCreator) return;
      setConfirmDialogData({ type: 'projTeamDelete', teamId: team.id, message: 'Bu proje takımını silmek istediğine emin misin?' });
      setShowConfirmDialog(true);
    };

    const handleAddMembers = () => {
      setProjectMemberSelection([]);
      setShowAddMembersToProjectModal(true);
    };

    const confirmAddMembers = () => {
      const addIds = projectMemberSelection.filter(Boolean);
      setShowAddMembersToProjectModal(false);
      if (addIds.length === 0) return;
      updateTeam(team.id, t => ({ ...t, members: Array.from(new Set([...(t.members || []), ...addIds])) }));
    };

    const handleLeave = () => {
      if (!isMember || isCreator) return;
      updateTeam(team.id, t => ({ ...t, members: (t.members || []).filter(id => id !== currentUser?.id) }));
    };

    const handleRemoveMember = (uid) => {
      if (!isCreator) return;
      if (uid === currentUser?.id) return; // creator cannot remove self
      updateTeam(team.id, t => ({ ...t, members: (t.members || []).filter(id => id !== uid) }));
    };

    const renderMember = (uid) => {
      const user = allUsers.find(u => u.id === uid);
      const name = user?.name || '—';
      const avatar = user?.profileImageUrl;
      return (
        <View key={uid} style={styles.memberRow}>
          <Image source={avatar ? { uri: avatar } : require('./assets/user.png')} style={styles.memberAvatar} />
          <Text style={styles.memberName}>{name}</Text>
          {isCreator && uid !== currentUser?.id && (
            <TouchableOpacity style={[styles.deleteButton, styles.memberDeleteButton]} onPress={() => handleRemoveMember(uid)}>
              <Image source={require('./assets/delete.png')} style={styles.deleteIcon} />
            </TouchableOpacity>
                    )}
                  </View>
      );
    };

    return (
      <ScrollView 
        style={styles.dashboardScrollView}
        contentContainerStyle={styles.dashboardContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageHeaderRow}>
          <Text style={styles.pageTitle}>{team.name}</Text>
          {isCreator && (
            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteTeam}>
              <Image source={require('./assets/delete.png')} style={styles.deleteIcon} />
            </TouchableOpacity>
          )}
          </View>
        <View style={styles.distCard}>
          <Text style={styles.distCardSubtitle}>{team.description}</Text>
        </View>

        <View style={styles.actionRow}>
          {isCreator && (
            <TouchableOpacity style={styles.smallActionButton} onPress={handleAddMembers}>
              <Text style={styles.smallActionText}>Üye Ekle</Text>
            </TouchableOpacity>
          )}
          {isMember && !isCreator && (
            <TouchableOpacity style={[styles.smallActionButton, styles.smallActionWarn]} onPress={handleLeave}>
              <Text style={[styles.smallActionText, styles.smallActionWarnText]}>Ayrıl</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.sectionTitle}>Üyeler</Text>
        {(team.members || []).length === 0 ? (
          <View style={styles.emptyState}><Text style={styles.emptyStateText}>Üye yok</Text></View>
        ) : (
          (team.members || []).map(renderMember)
        )}

        {showAddMembersToProjectModal && (
          <View style={styles.confirmDialogOverlay}>
            <View style={styles.confirmDialogBox}>
              <Text style={styles.confirmDialogTitle}>Üye Ekle</Text>
              <View style={{ maxHeight: 300 }}>
                <ScrollView>
                  {allUsers
                    .filter(u => u.id !== currentUser?.id)
                    .filter(u => !(team.members || []).includes(u.id))
                    .map(u => {
                      const selected = projectMemberSelection.includes(u.id);
                      return (
                        <TouchableOpacity key={u.id} style={styles.memberPickRow} onPress={() => setProjectMemberSelection(prev => selected ? prev.filter(id => id !== u.id) : [...prev, u.id])}>
                          <Image source={u.profileImageUrl ? { uri: u.profileImageUrl } : require('./assets/user.png')} style={styles.memberAvatar} />
                          <Text style={styles.memberName}>{u.name || '—'}</Text>
                          <Text style={styles.memberPickMark}>{selected ? '☑' : '☐'}</Text>
        </TouchableOpacity>
            );
          })
                  }
                </ScrollView>
              </View>
              <View style={styles.confirmDialogButtons}>
                <TouchableOpacity style={styles.confirmDialogButtonCancel} onPress={() => setShowAddMembersToProjectModal(false)}>
                  <Text style={styles.confirmDialogButtonCancelText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmDialogButtonConfirm} onPress={confirmAddMembers}>
                  <Text style={styles.confirmDialogButtonConfirmText}>Ekle</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderTeamCreate = () => {
    return (
      <ScrollView 
        style={styles.dashboardScrollView}
        contentContainerStyle={styles.dashboardContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageHeaderRow}>
          <Text style={styles.pageTitle}>Takım Oluştur</Text>
            </View>
        
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Takım Adı</Text>
            <TextInput
              style={styles.textInput}
              value={teamName}
              onChangeText={setTeamName}
              placeholder="Takım adını girin"
              placeholderTextColor="#999"
            />
              </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Açıklama</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={teamDescription}
              onChangeText={setTeamDescription}
              placeholder="Takım açıklamasını girin (opsiyonel)"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />
            </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Takım Üyeleri</Text>
        <TouchableOpacity 
              style={styles.memberPickerButton}
              onPress={() => setShowTeamMemberPicker(true)}
            >
              <Text style={styles.memberPickerButtonText}>
                {selectedTeamMembers.length > 0 
                  ? `${selectedTeamMembers.length} üye seçildi` 
                  : 'Üye seçin'
                }
          </Text>
              <Image source={require('./assets/team-add-member.png')} style={styles.memberPickerIcon} />
        </TouchableOpacity>

            {selectedTeamMembers.length > 0 && (
              <View style={styles.selectedMembersContainer}>
                {selectedTeamMembers.map((memberId) => {
                  const member = allUsers.find(u => u.id === memberId);
                  return (
                    <View key={memberId} style={styles.selectedMemberItem}>
                      <Text style={styles.selectedMemberName}>{member?.name}</Text>
        <TouchableOpacity 
                        style={styles.removeMemberButton}
          onPress={() => {
                          setSelectedTeamMembers(prev => prev.filter(id => id !== memberId));
          }}
        >
                        <Image source={require('./assets/team-remove-member.png')} style={styles.removeMemberIcon} />
                      </TouchableOpacity>
            </View>
                  );
                })}
              </View>
            )}
            </View>
          
          <TouchableOpacity 
            style={[styles.submitButton, (!teamName.trim() || selectedTeamMembers.length === 0) && styles.submitButtonDisabled]}
            onPress={handleCreateTeam}
            disabled={!teamName.trim() || selectedTeamMembers.length === 0}
          >
            <Text style={styles.submitButtonText}>Takım Oluştur</Text>
          </TouchableOpacity>
          </View>
        
        {/* Member Picker Modal */}
        {showTeamMemberPicker && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Üye Seçin</Text>
                <TouchableOpacity 
                  style={styles.modalCloseButton}
                  onPress={() => setShowTeamMemberPicker(false)}
                >
                  <Image source={require('./assets/close.png')} style={styles.modalCloseIcon} />
        </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.memberList}>
                {allUsers
                  .filter(user => user.id !== currentUser?.id)
                  .map((user) => {
                    const isSelected = selectedTeamMembers.includes(user.id);
                    return (
        <TouchableOpacity 
                        key={user.id}
                        style={[styles.memberItem, isSelected && styles.memberItemSelected]}
          onPress={() => {
                          if (isSelected) {
                            setSelectedTeamMembers(prev => prev.filter(id => id !== user.id));
                          } else {
                            setSelectedTeamMembers(prev => [...prev, user.id]);
                          }
                        }}
                      >
                        <View style={styles.memberItemContent}>
                          <Text style={styles.memberItemName}>{user.name}</Text>
                          {isSelected && (
                            <View style={styles.memberItemCheckmark}>
                              <Text style={styles.memberItemCheckmarkText}>✓</Text>
            </View>
                          )}
              </View>
                      </TouchableOpacity>
                    );
                  })}
              </ScrollView>
            </View>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderTeamManagement = () => {
    const team = navigationHistory[navigationHistory.length - 1]?.context?.selectedTeam || selectedTeam;
    if (!team) return null;
    
    return (
    <ScrollView 
      style={styles.dashboardScrollView}
      contentContainerStyle={styles.dashboardContent}
      showsVerticalScrollIndicator={false}
    >
        <View style={styles.pageHeaderRow}>
          <Text style={styles.pageTitle}>Takım Yönetimi</Text>
        </View>
        
        <View style={styles.teamManagementContainer}>
          <View style={styles.teamManagementHeader}>
            <View style={[styles.teamManagementColorIndicator, { backgroundColor: team.color }]} />
            <View style={styles.teamManagementInfo}>
              <Text style={styles.teamManagementName}>{team.name}</Text>
              <Text style={styles.teamManagementDescription}>
                {team.description || 'Açıklama yok'}
          </Text>
            </View>
          </View>
          
          <View style={styles.teamManagementSection}>
            <View style={styles.teamManagementSectionHeader}>
              <Text style={styles.teamManagementSectionTitle}>Takım Üyeleri</Text>
              <TouchableOpacity 
                style={styles.addMemberButton}
                onPress={() => setShowTeamMemberManagement(true)}
              >
                <Image source={require('./assets/team-add-member.png')} style={styles.addMemberIcon} />
                <Text style={styles.addMemberButtonText}>Üye Ekle</Text>
        </TouchableOpacity>
            </View>
            
            <View style={styles.teamManagementMembersList}>
              {team.members?.map((memberId) => {
                const member = allUsers.find(u => u.id === memberId);
                const isCreator = memberId === team.createdBy;
                return (
                  <View key={memberId} style={styles.teamManagementMemberItem}>
                    <View style={styles.teamManagementMemberAvatar}>
                      <Text style={styles.teamManagementMemberAvatarText}>
                        {member?.name?.charAt(0) || '?'}
                      </Text>
                    </View>
                    <View style={styles.teamManagementMemberInfo}>
                      <Text style={styles.teamManagementMemberName}>{member?.name || 'Bilinmeyen'}</Text>
                      {isCreator && (
                        <Text style={styles.teamManagementMemberRole}>Yönetici</Text>
                      )}
                    </View>
                    {!isCreator && (
        <TouchableOpacity 
                        style={styles.removeMemberFromTeamButton}
                        onPress={() => handleRemoveTeamMember(team.id, memberId)}
                      >
                        <Image source={require('./assets/team-remove-member.png')} style={styles.removeMemberFromTeamIcon} />
          </TouchableOpacity>
                    )}
            </View>
                );
              })}
              </View>
            </View>
        
          <View style={styles.teamManagementActions}>
            <TouchableOpacity 
              style={styles.deleteTeamButton}
              onPress={() => handleDeleteTeam(team.id)}
            >
              <Text style={styles.deleteTeamButtonText}>Takımı Sil</Text>
            </TouchableOpacity>
          </View>
          </View>

        {/* Add Member Modal */}
        {showTeamMemberManagement && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Üye Ekle</Text>
                <TouchableOpacity 
                  style={styles.modalCloseButton}
                  onPress={() => setShowTeamMemberManagement(false)}
                >
                  <Image source={require('./assets/close.png')} style={styles.modalCloseIcon} />
        </TouchableOpacity>
        </View>
        
              <ScrollView style={styles.memberList}>
                {allUsers
                  .filter(user => 
                    user.id !== currentUser?.id && 
                    !team.members?.includes(user.id)
                  )
                  .map((user) => (
        <TouchableOpacity 
                      key={user.id}
                      style={styles.memberItem}
          onPress={() => {
                        handleAddTeamMember(team.id, user.id);
                        setShowTeamMemberManagement(false);
                      }}
                    >
                      <View style={styles.memberItemContent}>
                        <Text style={styles.memberItemName}>{user.name}</Text>
            </View>
                    </TouchableOpacity>
                  ))}
              </ScrollView>
              </View>
            </View>
        )}
      </ScrollView>
    );
  };

  const renderTeamChat = () => {
    const team = navigationHistory[navigationHistory.length - 1]?.context?.selectedTeam || selectedTeam;
    console.log('Rendering team chat for team:', team);
    console.log('Current navigation history:', navigationHistory);
    console.log('Current page:', currentPage);
    
    if (!team) {
      console.log('No team found, showing loading state');
    return (
        <View style={styles.teamChatContainer}>
          <View style={styles.teamChatHeader}>
            <Text style={styles.teamChatName}>Takım yükleniyor...</Text>
        </View>
          <View style={styles.teamChatMessages}>
            <Text style={styles.emptyStateText}>Takım bilgileri yükleniyor...</Text>
          </View>
        </View>
      );
    }
    
    console.log('Rendering team chat with team:', team.name);
    console.log('Team messages:', teamMessages);
    console.log('Team replies:', teamReplies);
    
    return (
      <View style={styles.teamChatContainer}>
        <View style={styles.teamChatHeader}>
          <View style={styles.teamChatHeaderInfo}>
            <View style={[styles.teamChatColorIndicator, { backgroundColor: team.color }]} />
            <View style={styles.teamChatInfo}>
              <TouchableOpacity onPress={() => navigateToPage('teamManagement', { selectedTeam: team })}>
                <Text style={styles.teamChatName}>{team.name}</Text>
              </TouchableOpacity>
              <Text style={styles.teamChatMemberCount}>
                {team.memberCount || team.members?.length || 0} üye
              </Text>
            </View>
          </View>
        </View>

      <ScrollView 
          style={styles.teamChatMessages}
          contentContainerStyle={styles.teamChatMessagesContent}
          onContentSizeChange={() => {
            // Auto-scroll to bottom when content changes
          }}
        >
          {teamMessages.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Henüz mesaj yok. İlk mesajı siz gönderin!</Text>
            </View>
          ) : (
            teamMessages.map((message) => {
            const sender = allUsers.find(u => u.id === message.senderId);
            const isOwnMessage = message.senderId === currentUser?.id;
            const messageReplies = teamReplies.filter(reply => reply.parentMessageId === message.id);
            
            return (
              <View key={message.id} style={styles.teamMessageContainer}>
                <View style={[styles.teamMessage, isOwnMessage && styles.teamMessageOwn]}>
                  <View style={styles.teamMessageHeader}>
                    <Text style={[styles.teamMessageSender, isOwnMessage && styles.teamMessageOwnText]}>{sender?.name || 'Bilinmeyen'}</Text>
                    <Text style={[styles.teamMessageTime, isOwnMessage && styles.teamMessageOwnText]}>{getTimeAgo(message.createdAt)}</Text>
            </View>
                  <Text style={[styles.teamMessageContent, isOwnMessage && styles.teamMessageOwnText]}>{message.content}</Text>
                  
                  <View style={styles.teamMessageActions}>
            <TouchableOpacity 
                      style={styles.teamMessageReplyButton}
                      onPress={() => setReplyingToMessage(message)}
            >
                      <Text style={styles.teamMessageReplyText}>Yanıtla</Text>
            </TouchableOpacity>
          </View>
                  
                  {messageReplies.length > 0 && (
                    <View style={styles.teamMessageReplies}>
                      {messageReplies.map((reply) => {
                        const replySender = allUsers.find(u => u.id === reply.senderId);
                        const isOwnReply = reply.senderId === currentUser?.id;
                        
                        return (
                          <View key={reply.id} style={[styles.teamMessageReply, isOwnReply && styles.teamMessageReplyOwn]}>
                            <View style={styles.teamMessageReplyHeader}>
                              <Text style={styles.teamMessageReplySender}>{replySender?.name || 'Bilinmeyen'}</Text>
                              <Text style={styles.teamMessageReplyTime}>{getTimeAgo(reply.createdAt)}</Text>
        </View>
                            <Text style={styles.teamMessageReplyContent}>{reply.content}</Text>
                            
                            <View style={styles.teamMessageReplyActions}>
                              {/* Reply actions removed */}
                            </View>
      </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              </View>
            );
          })
          )}
      </ScrollView>
        
        {replyingToMessage && (
          <View style={styles.teamReplyInputContainer}>
            <View style={styles.teamReplyInputHeader}>
              <Text style={styles.teamReplyInputHeaderText}>
                {allUsers.find(u => u.id === replyingToMessage.senderId)?.name || 'Bilinmeyen'} kullanıcısına yanıt veriyorsunuz
              </Text>
              <TouchableOpacity 
                style={styles.teamReplyInputCancelButton}
                onPress={() => setReplyingToMessage(null)}
              >
                <Image source={require('./assets/close.png')} style={styles.teamReplyInputCancelIcon} />
              </TouchableOpacity>
            </View>
            <View style={styles.teamReplyInputRow}>
              <TextInput
                style={styles.teamReplyInput}
                value={teamReplyContent}
                onChangeText={setTeamReplyContent}
                placeholder="Yanıtınızı yazın..."
                placeholderTextColor="#999"
                multiline
              />
              <TouchableOpacity 
                style={[styles.teamReplySendButton, !teamReplyContent.trim() && styles.teamReplySendButtonDisabled]}
                onPress={handleSendTeamReply}
                disabled={!teamReplyContent.trim()}
              >
                <Image source={require('./assets/send.png')} style={styles.teamReplySendIcon} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        <View style={styles.teamChatInputContainer}>
          <TextInput
            style={styles.teamChatInput}
            value={teamMessageContent}
            onChangeText={setTeamMessageContent}
            placeholder="Mesajınızı yazın..."
            placeholderTextColor="#999"
            multiline
          />
          <TouchableOpacity 
            style={[styles.teamChatSendButton, !teamMessageContent.trim() && styles.teamChatSendButtonDisabled]}
            onPress={handleSendTeamMessage}
            disabled={!teamMessageContent.trim()}
          >
            <Image source={require('./assets/send.png')} style={styles.teamChatSendIcon} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderCalendar = () => {
    const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

    const getDaysInMonth = (date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday = 0

      const days = [];
      
      // Add empty cells for days before the first day of month
      for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null);
      }
      
      // Add all days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        days.push(day);
      }
      
      return days;
    };

    const getEventsForDate = (date) => {
      if (!date) return [];
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      return eventsData.filter(event => event.date === dateStr);
    };

    const getEventForDay = (day) => {
      if (!day) return null;
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dayEvents = getEventsForDate(date);
      return dayEvents.length > 0 ? dayEvents[0] : null;
    };

    const goToPreviousMonth = () => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const handleDayPress = (day) => {
      if (day) {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const dayEvents = getEventsForDate(date);
        if (dayEvents.length > 0) {
          setSelectedEvent(dayEvents[0]);
          navigateToPage('eventDetail', { selectedEvent: event });
        } else {
          // Show create event prompt for empty day
          setCreateEventPromptDate(date);
          setShowCreateEventPrompt(true);
        }
      }
    };

    const isToday = (day) => {
      if (!day) return false;
      const today = new Date();
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      return date.toDateString() === today.toDateString();
    };

    const days = getDaysInMonth(currentMonth);

    return (
      <View style={styles.calendarFullScreen}>
      <Text style={styles.pageTitle}>Takvim</Text>
      
        {/* Calendar Header - Month Navigation */}
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.calendarNavButton}>
            <Text style={styles.calendarNavButtonText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.calendarMonthYear}>
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </Text>
          <TouchableOpacity onPress={goToNextMonth} style={styles.calendarNavButton}>
            <Text style={styles.calendarNavButtonText}>›</Text>
          </TouchableOpacity>
        </View>
        
        {/* Calendar Grid - Full Screen */}
        <View style={styles.calendarContainerFull}>
          {/* Day Names Header */}
          <View style={styles.calendarDayNamesRow}>
            {dayNames.map((dayName, index) => (
              <View key={index} style={styles.calendarDayNameCell}>
                <Text style={styles.calendarDayNameText}>{dayName}</Text>
        </View>
            ))}
      </View>

          {/* Calendar Days Grid */}
          <View style={styles.calendarDaysGridFull}>
            {days.map((day, index) => {
              const event = getEventForDay(day);
              const eventColor = event ? (event.hasImage || event.imageUrl ? '#1a1a1a' : '#999') : null;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.calendarDayCellFull,
                    !day && styles.calendarDayCellEmpty,
                    event && !event.imageUrl && { backgroundColor: eventColor },
                  ]}
                  onPress={() => handleDayPress(day)}
                  disabled={!day}
                >
                  {day ? (
                    <>
                      {event && event.imageUrl && (
                        <>
                          <Image 
                            source={{ uri: event.imageUrl }}
                            style={styles.calendarEventImage}
                          />
                          <LinearGradient
                            colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                            style={styles.calendarEventGradient}
                          />
                        </>
                      )}
                      <View style={styles.calendarDayCellContentFull}>
                        <Text style={[
                          styles.calendarDayTextFull,
                          event && styles.calendarDayTextWithEvent,
                          isToday(day) && styles.calendarDayTextTodayBold,
                        ]}>
                          {day}
        </Text>
                        {event && (
                          <Text style={styles.calendarEventNameInCell} numberOfLines={2}>
                            {event.name}
                          </Text>
                        )}
                        {isToday(day) && !event && (
                          <View style={styles.todayIndicator} />
                        )}
      </View>
                    </>
                  ) : null}
          </TouchableOpacity>
              );
            })}
        </View>
        </View>
        </View>
    );
  };

  const renderProfile = () => {
    const handleLogout = async () => {
      try {
        await logout();
        try {
          if (currentUser?.id) {
            await removePushToken(currentUser.id);
          }
        } catch (e) {
          console.log('Push token remove failed:', e?.message);
        }
        setIsAuthenticated(false);
        setCurrentUser(null);
        setShowMainPage(false);
      } catch (error) {
        console.error('Logout error:', error);
      }
    };

    const handlePickProfileImage = async () => {
      try {
        // Request permissions
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('İzin Gerekli', 'Galeriye erişim izni vermeniz gerekiyor.');
          return;
        }

        // Launch image picker
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
          setUploadingImage(true);
          try {
            const imageUri = result.assets[0].uri;
            await uploadProfileImage(currentUser.id, imageUri);
            
            // Update local state
            setProfileImageUri(imageUri);
            
            Alert.alert('Başarılı', 'Profil fotoğrafı güncellendi!');
          } catch (error) {
            console.error('Error uploading image:', error);
            Alert.alert('Hata', 'Fotoğraf yüklenirken bir hata oluştu.');
          } finally {
            setUploadingImage(false);
          }
        }
      } catch (error) {
        console.error('Error picking image:', error);
      }
    };

    const profileImage = profileImageUri || currentUser?.profileImageUrl;

    return (
    <ScrollView 
      style={styles.dashboardScrollView}
      contentContainerStyle={styles.dashboardContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.pageTitle}>Profil</Text>
      
        {/* Large Circular Profile Picture */}
        <View style={styles.profilePictureSection}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profilePictureLarge} />
          ) : (
            <View style={styles.profilePictureLarge} />
          )}
          <TouchableOpacity 
            style={styles.changePictureButtonLarge}
            onPress={handlePickProfileImage}
            disabled={uploadingImage}
          >
            <Image source={require('./assets/camera.png')} style={styles.changePictureIconLarge} />
          </TouchableOpacity>
      </View>

        {uploadingImage && (
          <Text style={styles.uploadingText}>Yükleniyor...</Text>
        )}

        {/* User Name */}
        <Text style={styles.profileNameLarge}>{currentUser?.name || 'Kullanıcı'}</Text>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleLogout}>
          <Text style={styles.signOutButtonText}>Çıkış Yap</Text>
          </TouchableOpacity>

        {/* Members List */}
        <View style={styles.membersSection}>
          <Text style={styles.membersSectionTitle}>Üyeler</Text>
          {allUsers.map((user) => (
            <View key={user.id} style={styles.memberCard}>
              {user.profileImageUrl ? (
                <Image source={{ uri: user.profileImageUrl }} style={styles.memberAvatar} />
              ) : (
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberInitial}>{user.name?.charAt(0) || 'U'}</Text>
          </View>
              )}
              <Text style={styles.memberName}>{user.name}</Text>
          </View>
          ))}
      </View>
    </ScrollView>
  );
  };

  const getTimeAgo = (dateInput) => {
    if (!dateInput) return 'Bilinmiyor';
    
    let date;
    
    // Handle Firebase timestamp objects
    if (dateInput && typeof dateInput === 'object' && dateInput.seconds) {
      date = new Date(dateInput.seconds * 1000);
    } else if (typeof dateInput === 'string') {
      date = new Date(dateInput);
    } else {
      return 'Bilinmiyor';
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Bilinmiyor';
    }
    
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSecs < 10) return 'Az önce';
    if (diffSecs < 60) return `${diffSecs} saniye önce`;
    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays === 1) return 'Dün';
    if (diffDays === 2) return 'İki gün önce';
    if (diffDays < 7) return `${diffDays} gün önce`;
    if (diffDays < 14) return 'Bir hafta önce';
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
    
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const getAvatarColor = (name) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#95E1D3', '#FFB6B9', '#FFA500', '#9B59B6', '#3498DB'];
    const index = (name?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  };

  const renderMessageDetail = () => {
    if (!selectedMessage) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Mesaj bulunamadı</Text>
            </View>
      );
    }

    const senderUser = allUsers.find(u => u.name === selectedMessage.sender);

    return (
    <ScrollView 
      style={styles.dashboardScrollView}
      contentContainerStyle={styles.dashboardContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.messageDetailCard}>
        <View style={styles.messageHeader}>
            {senderUser?.profileImageUrl ? (
              <Image source={{ uri: senderUser.profileImageUrl }} style={styles.userAvatarImage} />
            ) : (
              <View style={[styles.userAvatar, { backgroundColor: getAvatarColor(selectedMessage.sender) }]}>
                <Text style={styles.avatarInitial}>{selectedMessage.sender?.charAt(0) || '?'}</Text>
          </View>
            )}
          <View style={styles.messageHeaderInfo}>
              <Text style={styles.messageSender}>{selectedMessage.sender}</Text>
              <Text style={styles.messageDate}>{getTimeAgo(selectedMessage.createdAt)}</Text>
          </View>
            {selectedMessage.senderId === currentUser?.id && (
              <TouchableOpacity
                onPress={() => handleDeleteMessage(selectedMessage.id)}
                style={styles.deleteMessageButton}
              >
                <Image source={require('./assets/delete.png')} style={styles.deleteMessageIcon} />
              </TouchableOpacity>
            )}
        </View>
        
          <Text style={styles.messageDetailTitle}>{selectedMessage.title}</Text>
          
          <Text style={styles.messageDetailContent}>{selectedMessage.content}</Text>

          {selectedMessage.ccUsers && selectedMessage.ccUsers.length > 0 && (
            <Text style={styles.messageCcDetail}>
              CC: {selectedMessage.ccUsers.join(', ')}
        </Text>
          )}
      </View>

      <View style={styles.repliesSection}>
          <Text style={styles.repliesSectionTitle}>
            Yanıtlar ({repliesData.length})
          </Text>
          
          {repliesData.length > 0 && (
            repliesData.map((reply) => {
              const replyUser = allUsers.find(u => u.name === reply.sender);
              return (
                <View key={reply.id} style={styles.replyCard}>
          <View style={styles.replyHeader}>
                    {replyUser?.profileImageUrl ? (
                      <Image source={{ uri: replyUser.profileImageUrl }} style={styles.userAvatarSmallImage} />
                    ) : (
                      <View style={[styles.userAvatarSmall, { backgroundColor: getAvatarColor(reply.sender) }]}>
                        <Text style={styles.avatarInitialSmall}>{reply.sender?.charAt(0) || '?'}</Text>
            </View>
                    )}
            <View style={styles.replyHeaderInfo}>
                      <Text style={styles.replySender}>{reply.sender}</Text>
                      <Text style={styles.replyDate}>{getTimeAgo(reply.createdAt)}</Text>
            </View>
                    {reply.senderId === currentUser?.id && (
                      <TouchableOpacity
                        onPress={() => handleDeleteReply(reply.id)}
                        style={styles.deleteReplyButton}
                      >
                        <Image source={require('./assets/delete.png')} style={styles.deleteReplyIcon} />
                      </TouchableOpacity>
                    )}
          </View>
                  <Text style={styles.replyContent}>{reply.content}</Text>
        </View>
              );
            })
          )}
      </View>

      <View style={styles.replyInputContainer}>
          <View style={{ flex: 1 }}>
        <TextInput
          style={styles.replyInput}
          placeholder="Yanıt yaz..."
          placeholderTextColor="#999"
          multiline
              value={replyContent}
              onChangeText={handleReplyTextChange}
            />
            
            {/* Mention Suggestions Dropdown */}
            {showMentionSuggestions && (
              <View style={styles.mentionSuggestionsContainer}>
                <ScrollView style={styles.mentionSuggestionsList} nestedScrollEnabled={true}>
                  {getFilteredUsers().map((user) => (
                    <TouchableOpacity
                      key={user.id}
                      style={styles.mentionSuggestionItem}
                      onPress={() => insertMention(user.name)}
                    >
                      <View style={[styles.mentionAvatar, { backgroundColor: getAvatarColor(user.name) }]}>
                        <Text style={styles.mentionAvatarText}>{user.name.charAt(0)}</Text>
                      </View>
                      <Text style={styles.mentionSuggestionText}>{user.name}</Text>
                    </TouchableOpacity>
                  ))}
                  {getFilteredUsers().length === 0 && (
                    <View style={styles.mentionSuggestionEmpty}>
                      <Text style={styles.mentionSuggestionEmptyText}>Kullanıcı bulunamadı</Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            )}
          </View>
          <TouchableOpacity 
            style={styles.sendButton}
            onPress={handleSendReply}
            disabled={!replyContent.trim()}
          >
          <Image source={require('./assets/send.png')} style={styles.sendIcon} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
  };

  const toggleCCUser = (userName) => {
    if (ccUsers.includes(userName)) {
      setCcUsers(ccUsers.filter(name => name !== userName));
    } else {
      setCcUsers([...ccUsers, userName]);
    }
  };

  const handleSendMessage = async () => {
    if (!messageTitle.trim() || !messageContent.trim()) {
      Alert.alert('Uyarı', 'Lütfen başlık ve içerik alanlarını doldurun.');
      return;
    }

    try {
      const messageId = await createMessage({
        title: messageTitle.trim(),
        content: messageContent.trim(),
        sender: currentUser?.name || 'Anonim',
        senderId: currentUser?.id || '',
        ccUsers: ccUsers,
      });

      // Notify CC'd users
      if (ccUsers.length > 0) {
        await notifyMessageCCUsers(ccUsers, {
          title: messageTitle.trim(),
          sender: currentUser?.name || 'Anonim',
          messageId: messageId
        }, allUsers);
      }

      showToastNotification('Mesaj oluşturuldu');
      setMessageTitle('');
      setMessageContent('');
      setCcUsers([]);
      navigateToPage('messages');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Hata', 'Mesaj gönderilirken bir hata oluştu.');
    }
  };

  // Extract @mentions from text
  const extractMentions = (text) => {
    const mentionRegex = /@(\w+(?:\s+\w+)?)/g;
    const mentions = [];
    let match;
    
    while ((match = mentionRegex.exec(text)) !== null) {
      const mentionedName = match[1];
      // Check if this user exists
      const user = allUsers.find(u => u.name.toLowerCase() === mentionedName.toLowerCase());
      if (user && !mentions.includes(user.name)) {
        mentions.push(user.name);
      }
    }
    
    return mentions;
  };

  const handleReplyTextChange = (text) => {
    setReplyContent(text);

    // Check if user is typing a mention
    const lastAtSymbol = text.lastIndexOf('@');
    
    if (lastAtSymbol !== -1) {
      const textAfterAt = text.substring(lastAtSymbol + 1);
      const nextSpace = textAfterAt.indexOf(' ');
      
      // If there's no space after @, we're still typing the mention
      if (nextSpace === -1 || nextSpace > textAfterAt.length) {
        const currentMention = textAfterAt;
        setMentionFilter(currentMention);
        setMentionCursorPosition(lastAtSymbol);
        setShowMentionSuggestions(true);
      } else {
        setShowMentionSuggestions(false);
      }
    } else {
      setShowMentionSuggestions(false);
    }
  };

  const insertMention = (userName) => {
    const beforeMention = replyContent.substring(0, mentionCursorPosition);
    const afterMention = replyContent.substring(mentionCursorPosition + 1 + mentionFilter.length);
    
    const newText = `${beforeMention}@${userName} ${afterMention}`;
    setReplyContent(newText);
    setShowMentionSuggestions(false);
  };

  const getFilteredUsers = () => {
    if (!mentionFilter) return allUsers.filter(u => u.id !== currentUser?.id);
    
    return allUsers.filter(u => 
      u.id !== currentUser?.id && 
      u.name.toLowerCase().startsWith(mentionFilter.toLowerCase())
    );
  };

  const handleSendReply = async () => {
    if (!replyContent.trim() || !selectedMessage?.id) {
      return;
    }

    try {
      await createReply(selectedMessage.id, {
        content: replyContent.trim(),
        sender: currentUser?.name || 'Anonim',
        senderId: currentUser?.id || '',
      });

      // Notify tagged users only (removed message owner notification)
      const taggedUsers = extractMentions(replyContent);
      if (taggedUsers.length > 0) {
        await notifyTaggedUsers(
          taggedUsers,
          {
            sender: currentUser?.name || 'Anonim',
            senderId: currentUser?.id || '',
            messageId: selectedMessage.id
          },
          selectedMessage.title,
          allUsers
        );
      }

      // Reset reply input
      setReplyContent('');
      // Auto-insert original poster's tag for next reply
      if (selectedMessage.sender && selectedMessage.sender !== currentUser?.name) {
        setTimeout(() => {
          setReplyContent(`@${selectedMessage.sender} `);
        }, 100);
      } else {
        setReplyContent('');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      Alert.alert('Hata', 'Yanıt gönderilirken bir hata oluştu.');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    Alert.alert(
      'Mesajı Sil',
      'Bu mesajı silmek istediğinizden emin misiniz? Tüm yanıtlar da silinecektir.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMessage(messageId);
              showToastNotification('Mesaj silindi');
              navigateToPage('messages');
            } catch (error) {
              console.error('Error deleting message:', error);
              Alert.alert('Hata', 'Mesaj silinirken bir hata oluştu.');
            }
          }
        }
      ]
    );
  };

  const handleDeleteReply = async (replyId) => {
    if (!selectedMessage?.id) return;

    Alert.alert(
      'Yanıtı Sil',
      'Bu yanıtı silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteReply(selectedMessage.id, replyId);
              showToastNotification('Yanıt silindi');
            } catch (error) {
              console.error('Error deleting reply:', error);
              Alert.alert('Hata', 'Yanıt silinirken bir hata oluştu.');
            }
          }
        }
      ]
    );
  };

  const renderMessageCreate = () => {
    return (
      <View style={{ flex: 1 }}>
    <ScrollView 
      style={styles.dashboardScrollView}
      contentContainerStyle={styles.dashboardContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.pageTitle}>Yeni Mesaj</Text>

      <View style={styles.createFormSection}>
        <Text style={styles.formLabel}>Başlık</Text>
        <TextInput
          style={styles.formInput}
          placeholder="Mesaj başlığı..."
          placeholderTextColor="#999"
              value={messageTitle}
              onChangeText={setMessageTitle}
        />
      </View>

      <View style={styles.createFormSection}>
        <Text style={styles.formLabel}>İçerik</Text>
        <TextInput
          style={[styles.formInput, styles.formTextArea]}
          placeholder="Mesajınızı yazın..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={8}
              value={messageContent}
              onChangeText={setMessageContent}
        />
      </View>

          <View style={styles.createFormSection}>
            <Text style={styles.formLabel}>CC (İletilecek Kullanıcılar)</Text>
            <TouchableOpacity 
              style={styles.formInput}
              onPress={() => setShowCCPicker(true)}
            >
              <Text style={ccUsers.length > 0 ? styles.datePickerText : styles.datePickerPlaceholder}>
                {ccUsers.length > 0 ? ccUsers.join(', ') : 'Kullanıcı seç (isteğe bağlı)'}
              </Text>
        </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSendMessage}>
            <Text style={styles.submitButtonText}>Mesaj Oluştur</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* CC Users Picker Modal */}
        {showCCPicker && (
          <View style={styles.datePickerOverlay}>
            <TouchableOpacity 
              style={styles.datePickerBackdrop}
              activeOpacity={1}
              onPress={() => setShowCCPicker(false)}
            />
            <View style={styles.datePickerModal}>
              <View style={styles.datePickerHeader}>
                <Text style={styles.datePickerTitle}>Kullanıcı Seç (CC)</Text>
                <TouchableOpacity onPress={() => setShowCCPicker(false)}>
                  <Image source={require('./assets/close.png')} style={styles.datePickerCloseIcon} />
        </TouchableOpacity>
      </View>
              <ScrollView style={styles.datePickerCalendar}>
                {allUsers.map((user) => {
                  // Don't show current user in CC list
                  if (user.id === currentUser?.id) return null;
                  
                  const isSelected = ccUsers.includes(user.name);
                  return (
                    <TouchableOpacity
                      key={user.id}
                      style={[
                        styles.datePickerOption,
                        isSelected && styles.datePickerOptionSelected
                      ]}
                      onPress={() => toggleCCUser(user.name)}
                    >
                      <Text style={[
                        styles.datePickerOptionText,
                        isSelected && styles.datePickerOptionTextSelected
                      ]}>
                        {user.name} {isSelected && '✓'}
                      </Text>
      </TouchableOpacity>
                  );
                })}
    </ScrollView>
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={() => setShowCCPicker(false)}
              >
                <Text style={styles.submitButtonText}>Tamam</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderEventCreate = () => {
    const handleCreateEvent = async () => {
      if (!eventName.trim()) {
        setEventNameError(true);
        return;
      }
      
      try {
        await createEvent({
          name: eventName,
          date: eventDate ? eventDate.toISOString().split('T')[0] : null,
          captain: eventCaptain,
          coCaptain: eventBackupCaptain,
          announced: false, // Default to not announced
        }, currentUser.id);

        // Reset form
        setEventName('');
        setEventDate(null);
        setEventCaptain('');
        setEventBackupCaptain('');
        setEventNameError(false);
        navigateToPage('events');
      } catch (error) {
        console.error('Create event error:', error);
        alert('Etkinlik oluşturulurken bir hata oluştu');
      }
    };

    const formatDate = (date) => {
      if (!date) return '';
      const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
      return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    };

    return (
      <View style={{ flex: 1 }}>
    <ScrollView 
      style={styles.dashboardScrollView}
      contentContainerStyle={styles.dashboardContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.pageTitle}>Yeni Etkinlik</Text>

      <View style={styles.createFormSection}>
        <Text style={styles.formLabel}>Etkinlik Adı</Text>
        <TextInput
              style={[
                styles.formInput,
                eventNameError && styles.formInputError
              ]}
              placeholder="Etkinlik adı"
          placeholderTextColor="#999"
              value={eventName}
              onChangeText={(text) => {
                setEventName(text);
                if (text.trim()) setEventNameError(false);
              }}
        />
            {eventNameError && (
              <Text style={styles.formErrorText}>Etkinlik adı zorunludur</Text>
            )}
      </View>

      <View style={styles.createFormSection}>
        <Text style={styles.formLabel}>Tarih</Text>
            <TouchableOpacity 
          style={styles.formInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={eventDate ? styles.datePickerText : styles.datePickerPlaceholder}>
                {eventDate ? formatDate(eventDate) : 'Tarih seç'}
              </Text>
            </TouchableOpacity>
      </View>

      <View style={styles.createFormSection}>
            <Text style={styles.formLabel}>Kaptan</Text>
            <TouchableOpacity 
          style={styles.formInput}
              onPress={() => setShowCaptainPicker(true)}
            >
              <Text style={eventCaptain ? styles.datePickerText : styles.datePickerPlaceholder}>
                {eventCaptain || 'Kaptan seç'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.createFormSection}>
            <Text style={styles.formLabel}>Yedek Kaptan</Text>
            <TouchableOpacity 
              style={styles.formInput}
              onPress={() => setShowCoCaptainPicker(true)}
            >
              <Text style={eventBackupCaptain ? styles.datePickerText : styles.datePickerPlaceholder}>
                {eventBackupCaptain || 'Yedek kaptan seç'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.eventCreateNote}>
            <Text style={styles.eventCreateNoteText}>
              💡 Etkinlik detayları (saat, konum, açıklama, resim) daha sonra düzenlenebilir.
            </Text>
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleCreateEvent}>
            <Text style={styles.submitButtonText}>Etkinliği Oluştur</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Date Picker Modal */}
        {showDatePicker && (
          <View style={styles.datePickerOverlay}>
            <TouchableOpacity 
              style={styles.datePickerBackdrop}
              activeOpacity={1}
              onPress={() => setShowDatePicker(false)}
            />
            <View style={styles.datePickerModal}>
              <View style={styles.datePickerHeader}>
                <Text style={styles.datePickerTitle}>Tarih Seç</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Image source={require('./assets/close.png')} style={styles.datePickerCloseIcon} />
                </TouchableOpacity>
      </View>
              <ScrollView style={styles.datePickerCalendar}>
                {/* Simple date selection - next 60 days */}
                {Array.from({ length: 60 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() + i);
                  return date;
                }).map((date, index) => {
                  const isSelected = eventDate && date.toDateString() === eventDate.toDateString();
                  const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
                  const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.datePickerOption,
                        isSelected && styles.datePickerOptionSelected
                      ]}
                      onPress={() => {
                        setEventDate(date);
                        setShowDatePicker(false);
                      }}
                    >
                      <Text style={[
                        styles.datePickerOptionText,
                        isSelected && styles.datePickerOptionTextSelected
                      ]}>
                        {date.getDate()} {monthNames[date.getMonth()]} {date.getFullYear()} - {dayNames[date.getDay()]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        )}

        {/* Captain Picker Modal */}
        {showCaptainPicker && (
          <View style={styles.datePickerOverlay}>
            <TouchableOpacity 
              style={styles.datePickerBackdrop}
              activeOpacity={1}
              onPress={() => setShowCaptainPicker(false)}
            />
            <View style={styles.datePickerModal}>
              <View style={styles.datePickerHeader}>
                <Text style={styles.datePickerTitle}>Kaptan Seç</Text>
                <TouchableOpacity onPress={() => setShowCaptainPicker(false)}>
                  <Image source={require('./assets/close.png')} style={styles.datePickerCloseIcon} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.datePickerCalendar}>
                {allUsers.map((user) => {
                  const isSelected = eventCaptain === user.name;
                  return (
                    <TouchableOpacity
                      key={user.id}
                      style={[
                        styles.datePickerOption,
                        isSelected && styles.datePickerOptionSelected
                      ]}
                      onPress={() => {
                        setEventCaptain(user.name);
                        setShowCaptainPicker(false);
                      }}
                    >
                      <Text style={[
                        styles.datePickerOptionText,
                        isSelected && styles.datePickerOptionTextSelected
                      ]}>
                        {user.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        )}

        {/* Co-Captain Picker Modal */}
        {showCoCaptainPicker && (
          <View style={styles.datePickerOverlay}>
            <TouchableOpacity 
              style={styles.datePickerBackdrop}
              activeOpacity={1}
              onPress={() => setShowCoCaptainPicker(false)}
            />
            <View style={styles.datePickerModal}>
              <View style={styles.datePickerHeader}>
                <Text style={styles.datePickerTitle}>Yedek Kaptan Seç</Text>
                <TouchableOpacity onPress={() => setShowCoCaptainPicker(false)}>
                  <Image source={require('./assets/close.png')} style={styles.datePickerCloseIcon} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.datePickerCalendar}>
                {allUsers.map((user) => {
                  const isSelected = eventBackupCaptain === user.name;
                  return (
                    <TouchableOpacity
                      key={user.id}
                      style={[
                        styles.datePickerOption,
                        isSelected && styles.datePickerOptionSelected
                      ]}
                      onPress={() => {
                        setEventBackupCaptain(user.name);
                        setShowCoCaptainPicker(false);
                      }}
                    >
                      <Text style={[
                        styles.datePickerOptionText,
                        isSelected && styles.datePickerOptionTextSelected
                      ]}>
                        {user.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderEventDetail = () => {
    const selectedId = selectedEvent?.id;
    const event = selectedId
      ? (eventsData.find(e => e.id === selectedId) || selectedEvent)
      : eventsData[0];
    const eventDate = event.date ? new Date(event.date) : null;
    const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    
    // Handle checklist item updates
    const handleChecklistUpdate = async (field, value) => {
      try {
        if (!event?.id) return;
        
        const updateData = { [field]: value };
        await updateEvent(event.id, updateData);
        
        // Update local state
        setSelectedEvent(prev => ({ ...prev, [field]: value }));
        
      } catch (error) {
        console.error('Error updating checklist item:', error);
        Alert.alert('Hata', 'Durum güncellenirken bir hata oluştu.');
      }
    };
    
    const formatDate = (date) => {
      if (!date) return '-';
      return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    };
    
    return (
      <ScrollView 
        style={styles.dashboardScrollView}
        contentContainerStyle={styles.dashboardContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.eventDetailHeader}>
          <Text style={styles.eventDetailTitle}>{event.name}</Text>
          <TouchableOpacity 
            style={styles.eventEditButton}
            onPress={() => navigateToPage('eventEdit')}
          >
            <Image source={require('./assets/edit.png')} style={styles.eventEditIcon} />
            <Text style={styles.eventEditButtonText}>Düzenle</Text>
          </TouchableOpacity>
        </View>

        {/* Drive Button */}
        <View style={{ marginTop: 10, marginBottom: 10 }}>
          <TouchableOpacity 
            disabled={!event.driveLink}
            onPress={() => {
              if (event.driveLink) {
                Linking.openURL(event.driveLink);
              }
            }}
            style={[styles.driveButton, !event.driveLink && styles.driveButtonDisabled]}
          >
            <Text style={[styles.driveButtonText, !event.driveLink && styles.driveButtonTextDisabled]}>
              {event.driveLink ? 'Drive klasörüne git' : 'Henüz Drive linki eklenmedi'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Top Section: Image on left, Info on right */}
        <View style={styles.eventDetailTopSection}>
          {/* Left: Image */}
          {(event.hasImage || event.imageUrl) ? (
            <View style={styles.eventDetailImageContainer}>
              <Image 
                source={{ uri: event.imageUrl }}
                style={styles.eventDetailImageLarge}
              />
              <TouchableOpacity 
                style={styles.downloadImageButtonSmall}
                onPress={async () => {
                  try {
                    // Request permissions (writeOnly: true to only request photo write permission)
                    const { status } = await MediaLibrary.requestPermissionsAsync(true);
                    if (status !== 'granted') {
                      Alert.alert('İzin Gerekli', 'Fotoğraf kaydetmek için galeri izni vermeniz gerekiyor.');
                      return;
                    }

                    // Download the image
                    const fileUri = FileSystem.documentDirectory + 'event_image.jpg';
                    const downloadResult = await FileSystem.downloadAsync(event.imageUrl, fileUri);
                    
                    // Save to media library
                    await MediaLibrary.saveToLibraryAsync(downloadResult.uri);
                    
                    showToastNotification('Görsel indirildi');
                  } catch (error) {
                    console.error('Error downloading image:', error);
                    Alert.alert('Hata', 'Görsel indirilirken bir hata oluştu.');
                  }
                }}
              >
                <Image source={require('./assets/download.png')} style={styles.downloadImageButtonIconSmall} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.eventDetailImageContainer}>
              <View style={styles.eventDetailImagePlaceholder}>
                <Text style={styles.eventImagePlaceholderTextSmall}>Görsel yok</Text>
              </View>
            </View>
          )}

          {/* Right: Information */}
          <View style={styles.eventDetailInfoContainer}>
            <View style={styles.eventDetailInfoRow}>
              <Text style={styles.eventDetailInfoLabel}>Tarih</Text>
              <Text style={[styles.eventDetailInfoValue, !eventDate && styles.eventDetailValueEmpty]}>
                {formatDate(eventDate)}
              </Text>
            </View>

            <View style={styles.eventDetailInfoRow}>
              <Text style={styles.eventDetailInfoLabel}>Saat</Text>
              <Text style={[styles.eventDetailInfoValue, !event.time && styles.eventDetailValueEmpty]}>
                {event.time || '-'}
              </Text>
            </View>

            <View style={styles.eventDetailInfoRow}>
              <Text style={styles.eventDetailInfoLabel}>Konum</Text>
              <Text style={[styles.eventDetailInfoValue, !event.location && styles.eventDetailValueEmpty]}>
                {event.location || '-'}
              </Text>
            </View>

            <View style={styles.eventDetailInfoRow}>
              <Text style={styles.eventDetailInfoLabel}>Kaptan</Text>
              <Text style={[styles.eventDetailInfoValue, !event.captain && styles.eventDetailValueEmpty]}>
                {event.captain || '-'}
              </Text>
            </View>

            <View style={styles.eventDetailInfoRow}>
              <Text style={styles.eventDetailInfoLabel}>Yrd. Kaptan</Text>
              <Text style={[styles.eventDetailInfoValue, !(event.backupCaptain || event.coCaptain) && styles.eventDetailValueEmpty]}>
                {event.backupCaptain || event.coCaptain || '-'}
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom Section: Metin (full width) */}
        {(event.text || event.description) && (
          <View style={styles.eventDetailSection}>
            <View style={styles.eventDetailSectionHeader}>
              <Text style={styles.eventDetailSectionTitle}>Metin</Text>
              <TouchableOpacity 
                style={styles.copyTextButton}
                onPress={async () => {
                  try {
                    await Clipboard.setStringAsync(event.text || event.description || '');
                    showToastNotification('Metin panoya kopyalandı');
                  } catch (error) {
                    console.error('Error copying text:', error);
                  }
                }}
              >
                <Image source={require('./assets/copy.png')} style={styles.copyTextButtonIcon} />
                <Text style={styles.copyTextButtonText}>Metni Kopyala</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.eventDetailDescription}>{event.text || event.description}</Text>
          </View>
        )}

        {/* Checklist Section */}
        <View style={styles.checklistSection}>
          <Text style={styles.checklistTitle}>Etkinlik Durumu</Text>
          <View style={styles.checklistGrid}>
            <View style={styles.checklistRow}>
              <TouchableOpacity 
                style={styles.checklistItem}
                onPress={() => handleChecklistUpdate('whatsappAnnounced', !event.whatsappAnnounced)}
                activeOpacity={0.7}
              >
                <View style={styles.checklistCheckbox}>
                  <Text style={styles.checklistCheckboxText}>
                    {event.whatsappAnnounced ? '☑' : '☐'}
                  </Text>
                </View>
                <Text style={styles.checklistItemText}>WhatsApp duyurusu yapıldı</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.checklistItem}
                onPress={() => handleChecklistUpdate('instagramAnnounced', !event.instagramAnnounced)}
                activeOpacity={0.7}
              >
                <View style={styles.checklistCheckbox}>
                  <Text style={styles.checklistCheckboxText}>
                    {event.instagramAnnounced ? '☑' : '☐'}
                  </Text>
                </View>
                <Text style={styles.checklistItemText}>Instagram duyurusu yapıldı</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.checklistRow}>
              <TouchableOpacity 
                style={styles.checklistItem}
                onPress={() => handleChecklistUpdate('reelsPosted', !event.reelsPosted)}
                activeOpacity={0.7}
              >
                <View style={styles.checklistCheckbox}>
                  <Text style={styles.checklistCheckboxText}>
                    {event.reelsPosted ? '☑' : '☐'}
                  </Text>
                </View>
                <Text style={styles.checklistItemText}>Etkinlik reelsi atıldı</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.checklistItem}
                onPress={() => handleChecklistUpdate('documentsSubmitted', !event.documentsSubmitted)}
                activeOpacity={0.7}
              >
                <View style={styles.checklistCheckbox}>
                  <Text style={styles.checklistCheckboxText}>
                    {event.documentsSubmitted ? '☑' : '☐'}
                  </Text>
                </View>
                <Text style={styles.checklistItemText}>Belgeler teslim edildi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderEventEdit = () => {
    const event = selectedEvent || eventsData[0];
    const eventDate = event.date ? new Date(event.date) : null;
    const debouncedUpdate = (field, value, delay = 600) => {
      if (!event?.id) return;
      const timers = eventEditSaveTimersRef.current;
      if (timers[field]) {
        clearTimeout(timers[field]);
      }
      timers[field] = setTimeout(async () => {
        try {
          await updateEvent(event.id, { [field]: value });
          setSelectedEvent(prev => prev ? { ...prev, [field]: value } : prev);
          setEventsData(prev => prev.map(e => e.id === event.id ? { ...e, [field]: value } : e));
        } catch (e) {
          console.log('Autosave failed for', field, e?.message);
        }
      }, delay);
    };
    
    const handleDeleteEvent = () => {
      setConfirmDialogData({
        type: 'deleteFromEdit',
        message: 'Bu etkinliği silmek istediğinizden emin misiniz?'
      });
      setShowConfirmDialog(true);
    };
    
    const handleSaveChanges = () => {
      setConfirmDialogData({
        type: 'saveChanges',
        message: 'Değişiklikleri kaydetmek istediğinizden emin misiniz?'
      });
      setShowConfirmDialog(true);
    };

    const handlePickEventImage = async () => {
      try {
        // Request permissions
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('İzin Gerekli', 'Galeriye erişim izni vermeniz gerekiyor.');
          return;
        }

        // Launch image picker
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 1.0,
        });

        if (!result.canceled && result.assets[0]) {
          setUploadingImage(true);
          try {
            const imageUri = result.assets[0].uri;
            await uploadEventImage(event.id, imageUri);
            
            // Update local state
            setEventImageUri(imageUri);
            
            Alert.alert('Başarılı', 'Etkinlik görseli güncellendi!');
          } catch (error) {
            console.error('Error uploading image:', error);
            Alert.alert('Hata', 'Görsel yüklenirken bir hata oluştu.');
          } finally {
            setUploadingImage(false);
          }
        }
      } catch (error) {
        console.error('Error picking image:', error);
      }
    };
    
    // Handle checklist item updates
    const handleChecklistUpdate = async (field, value) => {
      try {
        if (!selectedEvent?.id) return;
        
        const updateData = { [field]: value };
        await updateEvent(selectedEvent.id, updateData);
        
        // Update local state
        setSelectedEvent(prev => ({ ...prev, [field]: value }));
        
        // Show success message
        const fieldNames = {
          whatsappAnnounced: 'WhatsApp duyurusu',
          instagramAnnounced: 'Instagram duyurusu', 
          reelsPosted: 'Reels paylaşımı',
          documentsSubmitted: 'Belge teslimi'
        };
        
        const action = value ? 'tamamlandı' : 'iptal edildi';
        showToastNotification(`${fieldNames[field]} ${action}`);
        
      } catch (error) {
        console.error('Error updating checklist item:', error);
        Alert.alert('Hata', 'Durum güncellenirken bir hata oluştu.');
      }
    };
    
    const formatDate = (date) => {
      if (!date) return '';
      const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
      return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    };
    
    return (
      <View style={{ flex: 1 }}>
        <ScrollView 
          style={styles.dashboardScrollView}
          contentContainerStyle={styles.dashboardContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.pageTitle}>Etkinliği Düzenle</Text>

          {/* Event Name - Full Width */}
      <View style={styles.createFormSection}>
            <Text style={styles.formLabel}>Etkinlik Adı</Text>
        <TextInput
          style={styles.formInput}
              placeholder="Etkinlik adı"
          placeholderTextColor="#999"
              value={editEventName}
          onChangeText={(v) => { setEditEventName(v); debouncedUpdate('name', v); }}
        />
      </View>

          {/* Top Section: Image on left, Info on right */}
          <View style={styles.eventDetailTopSection}>
            {/* Left: Image */}
            <View style={styles.eventDetailImageContainer}>
              {(event.imageUrl || eventImageUri) ? (
                <Image 
                  source={{ uri: eventImageUri || event.imageUrl }}
                  style={styles.eventDetailImageLarge}
                />
              ) : (
                <View style={styles.eventDetailImagePlaceholder}>
                  <Text style={styles.eventImagePlaceholderTextSmall}>Görsel yok</Text>
                </View>
              )}
              <TouchableOpacity 
                style={styles.downloadImageButtonSmall}
                onPress={handlePickEventImage}
                disabled={uploadingImage}
              >
                <Image source={require('./assets/picture-upload.png')} style={styles.downloadImageButtonIconSmall} />
              </TouchableOpacity>
            </View>

            {/* Right: Editable Information */}
            <View style={styles.eventDetailInfoContainer}>
              <View style={styles.eventEditCompactField}>
                <Text style={styles.eventDetailInfoLabel}>Tarih</Text>
                <TouchableOpacity 
                  style={styles.compactInput}
                  onPress={() => setShowEditDatePicker(true)}
                >
                  <Text style={editEventDate || eventDate ? styles.compactInputText : styles.compactInputPlaceholder}>
                    {editEventDate ? formatDate(editEventDate) : (eventDate ? formatDate(eventDate) : 'Tarih seç')}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.eventEditCompactField}>
                <Text style={styles.eventDetailInfoLabel}>Saat</Text>
        <TextInput
                  style={styles.compactInput}
                  placeholder="Saat"
          placeholderTextColor="#999"
                  value={editEventTime}
          onChangeText={(v) => { setEditEventTime(v); debouncedUpdate('time', v); }}
        />
      </View>

              <View style={styles.eventEditCompactField}>
                <Text style={styles.eventDetailInfoLabel}>Konum</Text>
        <TextInput
                  style={styles.compactInput}
                  placeholder="Konum"
          placeholderTextColor="#999"
                  value={editEventLocation}
          onChangeText={(v) => { setEditEventLocation(v); debouncedUpdate('location', v); }}
        />
      </View>

              <View style={styles.eventEditCompactField}>
                <Text style={styles.eventDetailInfoLabel}>Kaptan</Text>
                <TouchableOpacity 
                  style={styles.compactInput}
                  onPress={() => setShowEditCaptainPicker(true)}
                >
                  <Text style={editEventCaptain ? styles.compactInputText : styles.compactInputPlaceholder}>
                    {editEventCaptain || 'Kaptan'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.eventEditCompactField}>
                <Text style={styles.eventDetailInfoLabel}>Yrd. Kaptan</Text>
                <TouchableOpacity 
                  style={styles.compactInput}
                  onPress={() => setShowEditCoCaptainPicker(true)}
                >
                  <Text style={editEventCoCaptain ? styles.compactInputText : styles.compactInputPlaceholder}>
                    {editEventCoCaptain || 'Yrd. Kaptan'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Bottom Section: Metin (full width) */}
          <View style={styles.eventDetailSection}>
            <Text style={styles.eventDetailSectionTitle}>Metin</Text>
        <TextInput
              style={[styles.formInput, styles.formTextArea]}
              placeholder="Etkinlik metni"
          placeholderTextColor="#999"
              multiline
              numberOfLines={6}
              value={editEventText}
            onChangeText={(v) => { setEditEventText(v); debouncedUpdate('text', v, 800); }}
        />
      </View>

        {/* Drive Link */}
        <View style={styles.eventDetailSection}>
          <Text style={styles.eventDetailSectionTitle}>Drive linki</Text>
          <TextInput
            style={styles.formInput}
            placeholder="https://drive.google.com/..."
            placeholderTextColor="#999"
            value={typeof editDriveLink === 'string' && editDriveLink.length > 0 ? editDriveLink : (event.driveLink || '')}
            onChangeText={(v) => { setEditDriveLink(v); debouncedUpdate('driveLink', v, 600); }}
            autoCapitalize="none"
            autoCorrect={false}
        />
      </View>

          {/* Action Buttons */}
          <View style={styles.eventDetailActionsVertical}>
            {/* Checklist Section */}
            <View style={styles.checklistSection}>
              <Text style={styles.checklistTitle}>Etkinlik Durumu</Text>
              <View style={styles.checklistGrid}>
                <View style={styles.checklistRow}>
                  <TouchableOpacity 
                    style={styles.checklistItem}
                    onPress={() => handleChecklistUpdate('whatsappAnnounced', !event.whatsappAnnounced)}
                  >
                    <View style={styles.checklistCheckbox}>
                      <Text style={styles.checklistCheckboxText}>
                        {event.whatsappAnnounced ? '☑' : '☐'}
                      </Text>
                    </View>
                    <Text style={styles.checklistItemText}>WhatsApp duyurusu yapıldı</Text>
        </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.checklistItem}
                    onPress={() => handleChecklistUpdate('instagramAnnounced', !event.instagramAnnounced)}
                  >
                    <View style={styles.checklistCheckbox}>
                      <Text style={styles.checklistCheckboxText}>
                        {event.instagramAnnounced ? '☑' : '☐'}
                      </Text>
                    </View>
                    <Text style={styles.checklistItemText}>Instagram duyurusu yapıldı</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.checklistRow}>
                  <TouchableOpacity 
                    style={styles.checklistItem}
                    onPress={() => handleChecklistUpdate('reelsPosted', !event.reelsPosted)}
                  >
                    <View style={styles.checklistCheckbox}>
                      <Text style={styles.checklistCheckboxText}>
                        {event.reelsPosted ? '☑' : '☐'}
                      </Text>
                    </View>
                    <Text style={styles.checklistItemText}>Etkinlik reelsi atıldı</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.checklistItem}
                    onPress={() => handleChecklistUpdate('documentsSubmitted', !event.documentsSubmitted)}
                  >
                    <View style={styles.checklistCheckbox}>
                      <Text style={styles.checklistCheckboxText}>
                        {event.documentsSubmitted ? '☑' : '☐'}
                      </Text>
                    </View>
                    <Text style={styles.checklistItemText}>Belgeler teslim edildi</Text>
                  </TouchableOpacity>
                </View>
              </View>
      </View>

            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteEvent}>
              <Text style={styles.deleteButtonText}>Etkinliği Sil</Text>
            </TouchableOpacity>
      </View>
    </ScrollView>

        {/* Date Picker Modal for Edit */}
        {showEditDatePicker && (
          <View style={styles.datePickerOverlay}>
            <TouchableOpacity 
              style={styles.datePickerBackdrop}
              activeOpacity={1}
              onPress={() => setShowEditDatePicker(false)}
            />
            <View style={styles.datePickerModal}>
              <View style={styles.datePickerHeader}>
                <Text style={styles.datePickerTitle}>Tarih Seç</Text>
                <TouchableOpacity onPress={() => setShowEditDatePicker(false)}>
                  <Image source={require('./assets/close.png')} style={styles.datePickerCloseIcon} />
      </TouchableOpacity>
      </View>
              <ScrollView style={styles.datePickerCalendar}>
                {/* Simple date selection - next 60 days */}
                {Array.from({ length: 60 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() + i);
                  return date;
                }).map((date, index) => {
                  const isSelected = editEventDate && date.toDateString() === editEventDate.toDateString();
                  const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
                  const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.datePickerOption,
                        isSelected && styles.datePickerOptionSelected
                      ]}
                      onPress={() => {
                        setEditEventDate(date);
                        setShowEditDatePicker(false);
                        try {
                          if (event?.id) {
                            const iso = new Date(date).toISOString().split('T')[0];
                            updateEvent(event.id, { date: iso });
                            setSelectedEvent(prev => prev ? { ...prev, date: iso } : prev);
                            setEventsData(prev => prev.map(e => e.id === event.id ? { ...e, date: iso } : e));
                          }
                        } catch {}
                      }}
                    >
                      <Text style={[
                        styles.datePickerOptionText,
                        isSelected && styles.datePickerOptionTextSelected
                      ]}>
                        {date.getDate()} {monthNames[date.getMonth()]} {date.getFullYear()} - {dayNames[date.getDay()]}
                      </Text>
      </TouchableOpacity>
                  );
                })}
    </ScrollView>
            </View>
          </View>
        )}

        {/* Captain Picker Modal for Edit */}
        {showEditCaptainPicker && (
          <View style={styles.datePickerOverlay}>
            <TouchableOpacity 
              style={styles.datePickerBackdrop}
              activeOpacity={1}
              onPress={() => setShowEditCaptainPicker(false)}
            />
            <View style={styles.datePickerModal}>
              <View style={styles.datePickerHeader}>
                <Text style={styles.datePickerTitle}>Kaptan Seç</Text>
                <TouchableOpacity onPress={() => setShowEditCaptainPicker(false)}>
                  <Image source={require('./assets/close.png')} style={styles.datePickerCloseIcon} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.datePickerCalendar}>
                {allUsers.map((user) => {
                  const isSelected = editEventCaptain === user.name;
                  return (
                    <TouchableOpacity
                      key={user.id}
                      style={[
                        styles.datePickerOption,
                        isSelected && styles.datePickerOptionSelected
                      ]}
                      onPress={() => {
                        setEditEventCaptain(user.name);
                        setShowEditCaptainPicker(false);
                      }}
                    >
                      <Text style={[
                        styles.datePickerOptionText,
                        isSelected && styles.datePickerOptionTextSelected
                      ]}>
                        {user.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        )}

        {/* Co-Captain Picker Modal for Edit */}
        {showEditCoCaptainPicker && (
          <View style={styles.datePickerOverlay}>
            <TouchableOpacity 
              style={styles.datePickerBackdrop}
              activeOpacity={1}
              onPress={() => setShowEditCoCaptainPicker(false)}
            />
            <View style={styles.datePickerModal}>
              <View style={styles.datePickerHeader}>
                <Text style={styles.datePickerTitle}>Yardımcı Kaptan Seç</Text>
                <TouchableOpacity onPress={() => setShowEditCoCaptainPicker(false)}>
                  <Image source={require('./assets/close.png')} style={styles.datePickerCloseIcon} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.datePickerCalendar}>
                {allUsers.map((user) => {
                  const isSelected = editEventCoCaptain === user.name;
                  return (
                    <TouchableOpacity
                      key={user.id}
                      style={[
                        styles.datePickerOption,
                        isSelected && styles.datePickerOptionSelected
                      ]}
                      onPress={() => {
                        setEditEventCoCaptain(user.name);
                        setShowEditCoCaptainPicker(false);
                      }}
                    >
                      <Text style={[
                        styles.datePickerOptionText,
                        isSelected && styles.datePickerOptionTextSelected
                      ]}>
                        {user.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        )}
      </View>
    );
  };

  if (!fontsLoaded || checkingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="auto" />
      </View>
    );
  }

  // If not authenticated, show login
  if (!isAuthenticated) {
    return renderLogin();
  }

  if (showMainPage) {
    return (
      <SafeAreaView style={styles.appContainer}>
        {/* Overlay for dimming when menu is open */}
        {menuOpen && (
          <TouchableOpacity 
            style={styles.overlay} 
            activeOpacity={1} 
            onPress={toggleMenu}
          />
        )}

        {/* Left Toolbar (Sliding Menu) */}
        <Animated.View 
          style={[
            styles.leftToolbar,
            { transform: [{ translateX: menuSlideAnim }] }
          ]}
        >
          <View style={styles.menuHeader}>
            <Image source={require('./assets/itufklogo.png')} style={styles.menuLogo} />
            <Text style={styles.menuAppName}>İTÜ FK</Text>
          </View>

          <View style={styles.menuItems}>
            <TouchableOpacity 
              style={[styles.menuItem, currentPage === 'dashboard' && styles.menuItemActive]} 
              onPress={() => navigateTo('dashboard')}
            >
              <Image source={require('./assets/dashboard.png')} style={styles.menuIcon} />
              <Text style={styles.menuItemText}>Ana ekran</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.menuItem, currentPage === 'notifications' && styles.menuItemActive]} 
              onPress={() => navigateTo('notifications')}
            >
              <Image source={require('./assets/notifications.png')} style={styles.menuIcon} />
              <Text style={styles.menuItemText}>Bildirimler</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.menuItem, currentPage === 'events' && styles.menuItemActive]} 
              onPress={() => navigateTo('events')}
            >
              <Image source={require('./assets/events.png')} style={styles.menuIcon} />
              <Text style={styles.menuItemText}>Etkinlikler</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.menuItem, currentPage === 'tools' && styles.menuItemActive]} 
              onPress={() => navigateTo('tools')}
            >
              <Image source={require('./assets/tools.png')} style={styles.menuIcon} />
              <Text style={styles.menuItemText}>Araçlar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.menuItem, currentPage === 'calendar' && styles.menuItemActive]} 
              onPress={() => navigateTo('calendar')}
            >
              <Image source={require('./assets/calendar.png')} style={styles.menuIcon} />
              <Text style={styles.menuItemText}>Takvim</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.menuItem, currentPage === 'messages' && styles.menuItemActive]} 
              onPress={() => navigateTo('messages')}
            >
              <Image source={require('./assets/message_board.png')} style={styles.menuIcon} />
              <Text style={styles.menuItemText}>Mesaj Panosu</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.menuItem, currentPage === 'profile' && styles.menuItemActive]} 
              onPress={() => navigateTo('profile')}
            >
              <Image source={require('./assets/user.png')} style={styles.menuIcon} />
              <Text style={styles.menuItemText}>Profil</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.menuItem, currentPage === 'settings' && styles.menuItemActive]} 
              onPress={() => navigateTo('settings')}
            >
              <Image source={require('./assets/settings.png')} style={styles.menuIcon} />
              <Text style={styles.menuItemText}>Seçenekler</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Main Content with Top Drawer */}
        <Animated.View style={[styles.mainContainer, { opacity: fadeAnim }]}>
          {/* Top Drawer */}
          <View style={styles.topDrawer}>
            <View style={styles.leftSection}>
              <TouchableOpacity style={styles.iconButton} onPress={toggleMenu}>
                <View style={styles.iconFrame}>
                  <Image source={require('./assets/menu.png')} style={styles.icon} />
                </View>
              </TouchableOpacity>
              
              {/* Conditionally show back button */}
              {['messageDetail', 'messageCreate', 'eventCreate', 'eventDetail', 'eventEdit'].includes(currentPage) && (
                <TouchableOpacity style={styles.iconButton} onPress={handleBackPress}>
                  <View style={styles.iconFrame}>
                    <Image source={require('./assets/back.png')} style={styles.icon} />
                  </View>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.centerLogoContainer}>
              <Image source={require('./assets/itufklogo.png')} style={styles.topLogo} />
            </View>

            <View style={styles.rightSection}>
              <TouchableOpacity style={styles.iconButton} onPress={() => setSearchOpen(true)}>
                <View style={styles.iconFrame}>
                  <Image source={require('./assets/search.png')} style={styles.icon} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => setNotificationsDropdownOpen(!notificationsDropdownOpen)}>
                <View style={styles.iconFrame}>
                  <Image source={require('./assets/notifications.png')} style={styles.icon} />
                  {notificationsData.filter(n => !n.read).length > 0 && (
                    <View style={styles.notificationBadge}>
                      <Text style={styles.notificationBadgeText}>
                        {notificationsData.filter(n => !n.read).length}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Page Content */}
          {/* Header with back button for detail pages */}
          {(currentPage === 'messageDetail' || currentPage === 'eventDetail' || currentPage === 'eventEdit' || currentPage === 'messageCreate' || currentPage === 'eventCreate') && (
            <View style={styles.detailHeader}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => {
                  const target = getPreferredBackTarget();
                  if (target) {
                    navigateToPage(target);
                  } else {
                    navigateBack();
                  }
                }}
              >
                <Image source={require('./assets/back.png')} style={styles.backButtonIcon} />
                <Text style={styles.backButtonText}>Geri</Text>
              </TouchableOpacity>
              <Text style={styles.detailHeaderTitle}>
                {currentPage === 'messageDetail' && 'Mesaj Detayı'}
                {currentPage === 'eventDetail' && 'Etkinlik Detayı'}
                {currentPage === 'eventEdit' && 'Etkinlik Düzenle'}
                {currentPage === 'messageCreate' && 'Mesaj Oluştur'}
                {currentPage === 'eventCreate' && 'Etkinlik Oluştur'}
              </Text>
              <View style={styles.detailHeaderSpacer} />
            </View>
          )}
          {renderPageContent()}

          {/* Notifications Dropdown */}
          {notificationsDropdownOpen && (
            <>
              <TouchableOpacity 
                style={styles.notificationsBackdrop}
                activeOpacity={1}
                onPress={() => setNotificationsDropdownOpen(false)}
              />
              <View style={styles.notificationsDropdown}>
              {notificationsData.length === 0 ? (
                <View style={styles.notificationDropdownEmpty}>
                  <Text style={styles.notificationDropdownEmptyText}>Henüz bildirim yok</Text>
                </View>
              ) : (
                <>
                  {notificationsData.slice(0, 5).map((notification) => {
                    const icon = notification.type === 'message_cc' ? '📧' :
                                notification.type === 'message_reply' ? '💬' :
                                notification.type === 'reply_tag' ? '🏷️' :
                                notification.type === 'event_announcement' ? '⚠️' : '🔔';
                    
                    return (
              <TouchableOpacity 
                        key={notification.id}
                        style={[
                          styles.notificationDropdownItem,
                          !notification.read && styles.notificationDropdownItemUnread
                        ]}
                onPress={() => {
                  setNotificationsDropdownOpen(false);
                          handleNotificationClick(notification);
                }}
              >
                        <Text style={styles.notificationDropdownIcon}>{icon}</Text>
                <View style={styles.notificationDropdownInfo}>
                          <Text style={styles.notificationDropdownTitle}>{notification.title}</Text>
                          <Text style={styles.notificationDropdownTime}>{getTimeAgo(notification.createdAt)}</Text>
                </View>
                        {!notification.read && <View style={styles.notificationDropdownUnreadDot} />}
              </TouchableOpacity>
                    );
                  })}

              <TouchableOpacity 
                style={styles.viewAllNotifications}
                onPress={() => {
                  setNotificationsDropdownOpen(false);
                  navigateToPage('notifications');
                }}
              >
                <Text style={styles.viewAllNotificationsText}>Tümünü gör</Text>
              </TouchableOpacity>
                </>
              )}
            </View>
            </>
          )}

          <StatusBar style="dark" />
        </Animated.View>

        {/* Search Overlay */}
        {searchOpen && (
          <View style={styles.searchOverlay}>
            <TouchableOpacity 
              style={styles.searchOverlayBackground}
              activeOpacity={1}
              onPress={() => setSearchOpen(false)}
            />
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Image source={require('./assets/search.png')} style={styles.searchInputIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Ara..."
                  placeholderTextColor="#999"
                  autoFocus={true}
                />
                <TouchableOpacity onPress={() => setSearchOpen(false)}>
                  <Image source={require('./assets/close.png')} style={styles.searchCloseIcon} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <View style={styles.confirmDialogOverlay}>
            <View style={styles.confirmDialogBox}>
              <Text style={styles.confirmDialogTitle}>Emin misin?</Text>
              <Text style={styles.confirmDialogMessage}>{confirmDialogData.message}</Text>
              <View style={styles.confirmDialogButtons}>
                <TouchableOpacity 
                  style={styles.confirmDialogButtonCancel}
                  onPress={() => setShowConfirmDialog(false)}
                >
                  <Text style={styles.confirmDialogButtonCancelText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.confirmDialogButtonConfirm}
                  onPress={handleConfirmDialogAction}
                >
                  <Text style={styles.confirmDialogButtonConfirmText}>Evet</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Create Event Prompt */}
        {showCreateEventPrompt && (
          <View style={styles.confirmDialogOverlay}>
            <View style={styles.confirmDialogBox}>
              <Text style={styles.confirmDialogTitle}>Etkinlik Oluştur</Text>
              <Text style={styles.confirmDialogMessage}>
                {createEventPromptDate && 
                  `${createEventPromptDate.getDate()} ${['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'][createEventPromptDate.getMonth()]} tarihinde bir etkinlik oluşturmak ister misiniz?`
                }
              </Text>
              <View style={styles.confirmDialogButtons}>
                <TouchableOpacity 
                  style={styles.confirmDialogButtonCancel}
                  onPress={() => setShowCreateEventPrompt(false)}
                >
                  <Text style={styles.confirmDialogButtonCancelText}>Hayır</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.confirmDialogButtonConfirm}
                  onPress={handleCreateEventFromCalendar}
                >
                  <Text style={styles.confirmDialogButtonConfirmText}>Evet</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Announcement Dialog */}
        {showAnnouncementDialog && (
          <View style={styles.confirmDialogOverlay}>
            <View style={styles.confirmDialogBox}>
              <Text style={styles.confirmDialogTitle}>Duyuru Durumu</Text>
              <Text style={styles.confirmDialogMessage}>
                {announcementStep === 1 
                  ? 'Bu etkinliğin duyurusu yapıldı mı?'
                  : 'Bak yapıldı mı kesin? Sonra uğraştırma milleti.'}
              </Text>
              <View style={styles.confirmDialogButtons}>
                <TouchableOpacity 
                  style={styles.confirmDialogButtonCancel}
                  onPress={() => {
                    setShowAnnouncementDialog(false);
                    setAnnouncementStep(1);
                  }}
                >
                  <Text style={styles.confirmDialogButtonCancelText}>Hayır</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.confirmDialogButtonConfirm}
                  onPress={async () => {
                    if (announcementStep === 1) {
                      setAnnouncementStep(2);
                    } else {
                      // Mark as announced in Firebase
                      try {
                        if (selectedEvent && selectedEvent.id) {
                          await updateEvent(selectedEvent.id, { announced: true });
                          setShowAnnouncementDialog(false);
                          setAnnouncementStep(1);
                          alert('Etkinlik duyurusu yapıldı olarak işaretlendi!');
                        }
                      } catch (error) {
                        console.error('Update announcement error:', error);
                        alert('Duyuru durumu güncellenirken bir hata oluştu');
                      }
                    }
                  }}
                >
                  <Text style={styles.confirmDialogButtonConfirmText}>Evet</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Documents Dialog */}
        {showDocumentsDialog && (
          <View style={styles.confirmDialogOverlay}>
            <View style={styles.confirmDialogBox}>
              <Text style={styles.confirmDialogTitle}>Belge Durumu</Text>
              <Text style={styles.confirmDialogMessage}>
                {documentsStep === 1 
                  ? 'Bu etkinliğin belgeleri teslim edildi mi?'
                  : 'Bak teslim edildi mi kesin? Sonra uğraştırma milleti.'}
              </Text>
              <View style={styles.confirmDialogButtons}>
                <TouchableOpacity 
                  style={styles.confirmDialogButtonCancel}
                  onPress={() => {
                    setShowDocumentsDialog(false);
                    setDocumentsStep(1);
                  }}
                >
                  <Text style={styles.confirmDialogButtonCancelText}>Hayır</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.confirmDialogButtonConfirm}
                  onPress={async () => {
                    if (documentsStep === 1) {
                      setDocumentsStep(2);
                    } else {
                      // Mark as documents submitted in Firebase
                      try {
                        if (selectedEvent && selectedEvent.id) {
                          await updateEvent(selectedEvent.id, { documentsSubmitted: true });
                          setShowDocumentsDialog(false);
                          setDocumentsStep(1);
                          showToastNotification('Belgeler teslim edildi olarak işaretlendi');
                        }
                      } catch (error) {
                        console.error('Update documents error:', error);
                        alert('Belge durumu güncellenirken bir hata oluştu');
                      }
                    }
                  }}
                >
                  <Text style={styles.confirmDialogButtonConfirmText}>Evet</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Toast Notification */}
        {showToast && (
          <Animated.View style={[styles.toastContainer, { opacity: toastOpacity }]}>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </Animated.View>
        )}
      </SafeAreaView>
    );
  }

  return (
    <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
      <Animated.Image
        source={require('./assets/itufklogo.png')}
        style={[
          styles.logo,
          {
            opacity: logoFadeAnim,
            transform: [{ scale: breathingAnim }],
          },
        ]}
      />
      <StatusBar style="auto" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: STATUS_BAR_HEIGHT,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  leftToolbar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: SCREEN_WIDTH * 0.75,
    backgroundColor: '#fff',
    zIndex: 2,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    paddingTop: STATUS_BAR_HEIGHT + 20,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 10,
  },
  menuLogo: {
    width: 45,
    height: 45,
    resizeMode: 'contain',
    marginRight: 12,
  },
  menuAppName: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 22,
    color: '#000',
  },
  menuItems: {
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginHorizontal: 10,
    marginVertical: 2,
  },
  menuIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    marginRight: 16,
    tintColor: '#666',
  },
  menuItemText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 16,
    color: '#333',
  },
  topDrawer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  centerLogoContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  iconButton: {
    padding: 5,
  },
  iconFrame: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  topLogo: {
    width: 55,
    height: 55,
    resizeMode: 'contain',
  },
  dashboardScrollView: {
    flex: 1,
  },
  dashboardContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  dashboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileFrame: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 24,
    color: '#fff',
  },
  welcomeText: {
    flex: 1,
  },
  welcomeMessage: {
    fontFamily: 'Inter_18pt-Light',
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  userName: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 20,
    color: '#000',
  },
  dateSectionRow: {
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  dateSection: {
    alignSelf: 'flex-start',
  },
  dateLabel: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 11,
    color: '#000',
    opacity: 0.5,
    marginBottom: 3,
  },
  dateValue: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 16,
    color: '#000',
    opacity: 0.5,
  },
  calendarButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  calendarButtonText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 14,
    color: '#000',
  },
  upcomingEventsSection: {
    marginTop: 20,
    width: '100%',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  upcomingEventsTitle: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 20,
    color: '#000',
  },
  sectionButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sectionButtonText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 14,
    color: '#000',
  },
  carousel: {
    width: '100%',
  },
  carouselContent: {
    paddingRight: HORIZONTAL_PADDING,
  },
  eventCard: {
    width: CARD_WIDTH,
    height: 150,
    borderRadius: 12,
    marginRight: CARD_GAP,
    overflow: 'hidden',
    position: 'relative',
  },
  imageWrapper: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  eventImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    transform: [{ scale: 2 }],
  },
  imageOpacityMask: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  eventContent: {
    position: 'absolute',
    left: 0,
    right: '25%',
    top: 0,
    bottom: 0,
    padding: 15,
    justifyContent: 'center',
  },
  eventName: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 18,
    color: '#fff',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginBottom: 8,
  },
  eventDate: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 13,
    color: '#fff',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  captainBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(34, 197, 94, 0.6)',
  },
  captainText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 11,
    color: '#4ADE80',
    textShadowColor: '#000',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 2,
  },
  messageBoardSection: {
    marginTop: 20,
    width: '100%',
    marginBottom: 30,
  },
  messageBoardTitle: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 20,
    color: '#000',
  },
  messageCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  messageCardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  messageCardContent: {
    flex: 1,
  },
  messageAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  messageAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  messageAvatarInitial: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 20,
    color: '#fff',
  },
  messageHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarInitial: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 16,
    color: '#fff',
  },
  messageHeaderInfo: {
    flex: 1,
  },
  messageTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageSender: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 15,
    color: '#000',
  },
  messageDate: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 12,
    color: '#999',
  },
  messageTitle: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 14,
    color: '#333',
  },
  messageContent: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 13,
    color: '#666',
    lineHeight: 19,
    marginBottom: 10,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyCount: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 12,
    color: '#999',
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  // Page Title
  pageTitle: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 28,
    color: '#000',
    marginBottom: 20,
  },
  // Notifications Page Styles
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  notificationIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 15,
    color: '#000',
    marginBottom: 2,
  },
  notificationTime: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 12,
    color: '#999',
  },
  notificationContent: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  notificationBold: {
    fontFamily: 'Inter_18pt-Medium',
    color: '#000',
  },
  // Events Page Styles
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  filterButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  filterButtonActive: {
    backgroundColor: '#333',
  },
  filterButtonText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 14,
    color: '#000',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  eventListItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  eventListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventListName: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 18,
    color: '#000',
    flex: 1,
    marginRight: 10,
  },
  eventListDate: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  announcementBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  announcementBadgeText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 12,
    color: '#4CAF50',
  },
  announcementBadgeWarning: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  announcementBadgeWarningText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 12,
    color: '#FF9800',
  },
  captainBadgeSmall: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  captainBadgeSmallText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 11,
    color: '#22C55E',
  },
  // Messages Page Styles
  unreadIndicator: {
    position: 'absolute',
    left: 8,
    top: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF9800',
  },
  taggedBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 10,
  },
  taggedBadgeText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 11,
    color: '#2196F3',
  },
  // Settings Page Styles
  settingsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingTitle: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 16,
    color: '#000',
    marginBottom: 4,
  },
  settingDescription: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 13,
    color: '#666',
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ccc',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#4CAF50',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  toggleThumbActive: {
    transform: [{ translateX: 22 }],
  },
  // Menu Active State
  menuItemActive: {
    backgroundColor: '#f0f0f0',
  },
  // Compact Notification Styles
  notificationCardCompact: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationIconCompact: {
    fontSize: 28,
    marginRight: 12,
  },
  notificationInfoCompact: {
    flex: 1,
  },
  notificationContentCompact: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  notificationTimeCompact: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 12,
    color: '#999',
  },
  // Search Overlay Styles
  searchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  searchOverlayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  searchContainer: {
    paddingTop: STATUS_BAR_HEIGHT + 15,
    paddingHorizontal: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  searchInputIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    tintColor: '#666',
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 16,
    color: '#000',
  },
  searchCloseIcon: {
    width: 20,
    height: 20,
    tintColor: '#666',
  },
  // Notifications Dropdown Styles
  notificationsBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 4,
  },
  notificationsDropdown: {
    position: 'absolute',
    top: 70,
    right: 20,
    width: SCREEN_WIDTH - 40,
    maxWidth: 350,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 5,
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 10,
    color: '#fff',
  },
  notificationDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 5,
    position: 'relative',
  },
  notificationDropdownItemUnread: {
    backgroundColor: '#f0f8ff',
  },
  notificationDropdownIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  notificationDropdownInfo: {
    flex: 1,
  },
  notificationDropdownTitle: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 13,
    color: '#000',
    marginBottom: 2,
  },
  notificationDropdownTime: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 11,
    color: '#999',
  },
  notificationDropdownUnreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
  notificationDropdownEmpty: {
    padding: 20,
    alignItems: 'center',
  },
  notificationDropdownEmptyText: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 14,
    color: '#999',
  },
  viewAllNotifications: {
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 5,
  },
  viewAllNotificationsText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 14,
    color: '#007AFF',
  },
  // Page Header Row
  pageHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonIcon: {
    width: 16,
    height: 16,
    tintColor: '#fff',
    marginRight: 6,
  },
  createButtonText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 13,
    color: '#fff',
  },
  createButtonUnderTitle: {
    alignSelf: 'flex-start',
    marginTop: 6,
    marginBottom: 16,
  },
  // Event Card Large
  eventCardLarge: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    position: 'relative',
  },
  toolsGrid: {
    gap: 12,
  },
  toolNavCard: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolNavIcon: {
    width: 28,
    height: 28,
    tintColor: '#111',
    marginRight: 12,
  },
  toolNavLabel: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 15,
    color: '#111',
  },
  driveButton: {
    backgroundColor: '#0E2A7A',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  driveButtonDisabled: {
    backgroundColor: '#ddd',
  },
  driveButtonText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 14,
    color: '#fff',
  },
  driveButtonTextDisabled: {
    color: '#777',
  },
  // Teneke list
  distCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  distCardInfo: {
    flexShrink: 1,
    paddingRight: 12,
  },
  distCardTitle: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 16,
    color: '#111',
    marginBottom: 4,
  },
  distCardSubtitle: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 12,
    color: '#555',
  },
  distDoneBadge: {
    backgroundColor: '#EAF7EE',
    borderColor: '#CFE9D6',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  distDoneText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 12,
    color: '#2e7d32',
  },
  // Teneke distribution detail
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  counterCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  counterLabel: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 12,
    color: '#555',
  },
  counterValue: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 18,
    color: '#111',
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  smallActionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginRight: 8,
  },
  smallActionWarn: {
    borderColor: '#9e2a2a',
  },
  smallActionText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 14,
    color: '#111',
  },
  smallActionWarnText: {
    color: '#9e2a2a',
  },
  sectionTitle: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 14,
    color: '#111',
    marginTop: 8,
    marginBottom: 8,
  },
  itemRow: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemInfo: {
    flexShrink: 1,
    paddingRight: 12,
  },
  itemTitle: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 14,
    color: '#111',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 12,
    color: '#555',
  },
  deleteButton: {
    padding: 6,
  },
  deleteIcon: {
    width: 20,
    height: 20,
    tintColor: '#9e2a2a',
  },
  receiverRow: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  receiverMain: {
    flex: 1,
    paddingRight: 12,
  },
  receiverName: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 14,
    color: '#111',
    marginBottom: 6,
  },
  receiverNote: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 12,
    color: '#777',
  },
  receiverControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paidToggle: {
    marginRight: 8,
  },
  paidToggleText: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 12,
    color: '#111',
  },
  receiverAmount: {
    width: 36,
    textAlign: 'center',
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 14,
    color: '#111',
  },
  circleButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleButtonDisabled: {
    opacity: 0.4,
  },
  circleButtonText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 16,
    color: '#111',
    marginTop: -1,
  },
  // Project Teams styles
  memberRow: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  memberAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 10,
  },
  memberName: {
    flex: 1,
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 14,
    color: '#111',
  },
  memberPickRow: {
    width: '100%',
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberPickMark: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 16,
    color: '#111',
  },
  memberDeleteButton: {
    marginLeft: 'auto',
  },
  reelsItemCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reelsItemCardClaimed: {
    backgroundColor: '#EAF7EE',
    borderColor: '#CFE9D6',
  },
  reelsItemInfo: {
    flexShrink: 1,
    paddingRight: 12,
  },
  reelsItemTitle: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 16,
    color: '#111',
    marginBottom: 4,
  },
  reelsItemSubtitle: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 12,
    color: '#555',
  },
  reelsActionButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  reelsClaim: {
    borderColor: '#2e7d32',
  },
  reelsUnclaim: {
    borderColor: '#9e2a2a',
  },
  reelsActionText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 13,
    color: '#111',
  },
  reelsTakenBadge: {
    backgroundColor: '#333',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  reelsTakenText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 12,
    color: '#fff',
  },
  
  eventContentLarge: {
    position: 'absolute',
    left: 0,
    right: '25%',
    top: 0,
    bottom: 0,
    padding: 15,
    justifyContent: 'center',
    zIndex: 2,
  },
  eventNameLarge: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 20,
    color: '#fff',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginBottom: 8,
  },
  eventDateTime: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 14,
    color: '#fff',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginBottom: 8,
  },
  announcementBadgeInline: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.6)',
  },
  announcementBadgeInlineText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 10,
    color: '#4ADE80',
    textShadowColor: '#000',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 2,
  },
  announcementBadgeWarningInline: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 152, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 0, 0.6)',
  },
  announcementBadgeWarningInlineText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 10,
    color: '#FFB74D',
    textShadowColor: '#000',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 2,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  tagTile: {
    width: '48%',
    marginBottom: 6,
  },
  backupCaptainBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(33, 150, 243, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(33, 150, 243, 0.6)',
  },
  backupCaptainText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 11,
    color: '#64B5F6',
    textShadowColor: '#000',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 2,
  },
  // Calendar Styles - Full Screen
  calendarFullScreen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
  },
  calendarNavButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarNavButtonText: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 28,
    color: '#007AFF',
  },
  calendarMonthYear: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 20,
    color: '#000',
  },
  calendarContainerFull: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  calendarDayNamesRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  calendarDayNameCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  calendarDayNameText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 12,
    color: '#999',
  },
  calendarDaysGridFull: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDayCellFull: {
    width: '13.5%',
    minHeight: 75,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 6,
    paddingTop: 8,
    marginRight: '0.7%',
    marginBottom: 6,
    borderRadius: 12,
    backgroundColor: '#f8f8f8',
    overflow: 'hidden',
    position: 'relative',
  },
  calendarEventImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  calendarEventGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
  },
  calendarDayCellEmpty: {
    backgroundColor: 'transparent',
  },
  calendarDayCellContentFull: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    flex: 1,
    zIndex: 1,
  },
  calendarDayTextFull: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 16,
    color: '#000',
    marginBottom: 4,
  },
  calendarDayTextWithEvent: {
    color: '#fff',
    fontFamily: 'Inter_18pt-Bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  calendarDayTextTodayBold: {
    fontFamily: 'Inter_18pt-Bold',
  },
  calendarEventNameInCell: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 9,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 11,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    marginTop: 2,
  },
  todayIndicator: {
    marginTop: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#007AFF',
  },
  // Profile Styles
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  profilePictureContainer: {
    position: 'relative',
    marginRight: 20,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
  },
  changePictureButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  changePictureIcon: {
    width: 16,
    height: 16,
    tintColor: '#007AFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 24,
    color: '#000',
    marginBottom: 4,
  },
  profileRole: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 14,
    color: '#666',
  },
  profileSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  profileSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileSectionTitle: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 18,
    color: '#000',
  },
  editIcon: {
    width: 20,
    height: 20,
    tintColor: '#007AFF',
  },
  profileField: {
    marginBottom: 15,
  },
  profileFieldLabel: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  profileFieldValue: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 16,
    color: '#000',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 28,
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 13,
    color: '#666',
  },
  // Message Detail Styles
  messageDetailCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  messageDetailTitle: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 20,
    color: '#000',
    marginTop: 15,
    marginBottom: 15,
  },
  messageDetailContent: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  repliesSection: {
    marginBottom: 20,
  },
  repliesSectionTitle: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 18,
    color: '#000',
    marginBottom: 15,
  },
  replyCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userAvatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  userAvatarSmallImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  avatarInitialSmall: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 13,
    color: '#fff',
  },
  replyHeaderInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  replySender: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 14,
    color: '#000',
  },
  replyDate: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 11,
    color: '#999',
  },
  replyContent: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  replyInput: {
    flex: 1,
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 15,
    color: '#000',
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#f0f0f0',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: {
    width: 18,
    height: 18,
    tintColor: '#fff',
  },
  // Create Form Styles
  createFormSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 14,
    color: '#000',
    marginBottom: 8,
  },
  requiredStar: {
    color: '#FF0000',
    fontFamily: 'Inter_18pt-Bold',
  },
  eventCreateNote: {
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  eventCreateNoteText: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 19,
  },
  formInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 15,
    color: '#000',
  },
  formInputError: {
    borderColor: '#FF0000',
    borderWidth: 2,
  },
  formErrorText: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 13,
    color: '#FF0000',
    marginTop: 5,
  },
  formTextArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  datePickerText: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 15,
    color: '#000',
  },
  datePickerPlaceholder: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 15,
    color: '#999',
  },
  datePickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  datePickerBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  datePickerModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  datePickerTitle: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 18,
    color: '#000',
  },
  datePickerCloseIcon: {
    width: 24,
    height: 24,
    tintColor: '#666',
  },
  datePickerCalendar: {
    maxHeight: 400,
  },
  datePickerOption: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  datePickerOptionSelected: {
    backgroundColor: '#E3F2FD',
  },
  datePickerOptionText: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 16,
    color: '#000',
  },
  datePickerOptionTextSelected: {
    fontFamily: 'Inter_18pt-Bold',
    color: '#007AFF',
  },
  createFormActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
  },
  attachIcon: {
    width: 16,
    height: 16,
    tintColor: '#666',
    marginRight: 8,
  },
  attachButtonText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 13,
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 16,
    color: '#fff',
  },
  deleteButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  deleteButtonText: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 16,
    color: '#333',
  },
  imageUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    borderStyle: 'dashed',
  },
  imageUploadIcon: {
    width: 24,
    height: 24,
    tintColor: '#666',
    marginRight: 10,
  },
  imageUploadText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 15,
    color: '#666',
  },
  // Event Detail Page Styles
  eventDetailHeader: {
    marginBottom: 20,
    position: 'relative',
  },
  eventDetailColorBar: {
    position: 'absolute',
    left: -20,
    top: 0,
    bottom: 0,
    width: 6,
  },
  eventDetailTitle: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 28,
    color: '#000',
    marginBottom: 15,
  },
  eventEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  eventEditIcon: {
    width: 16,
    height: 16,
    tintColor: '#fff',
    marginRight: 6,
  },
  eventEditButtonText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 14,
    color: '#fff',
  },
  eventDetailSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  eventDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  eventDetailLabel: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 15,
    color: '#666',
  },
  eventDetailValue: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 15,
    color: '#000',
  },
  eventDetailValueEmpty: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 15,
    color: '#999',
    fontStyle: 'italic',
  },
  eventDetailBadgeSection: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  eventDetailBadgeText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 15,
    color: '#000',
  },
  eventDetailSectionTitle: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 18,
    color: '#000',
    marginBottom: 12,
  },
  eventDetailDescription: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  eventAnnouncementStatus: {
    marginTop: 5,
  },
  announcementStatusGood: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  announcementStatusTextGood: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 14,
    color: '#4CAF50',
  },
  announcementStatusWarning: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  announcementStatusTextWarning: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 14,
    color: '#FF9800',
  },
  participantsList: {
    marginTop: 10,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  participantAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  participantInitial: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 14,
    color: '#fff',
  },
  participantName: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 15,
    color: '#000',
  },
  participantRole: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
  },
  eventImagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 10,
  },
  eventImagePreviewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  eventImagePlaceholder: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    borderStyle: 'dashed',
  },
  eventImagePlaceholderText: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 14,
    color: '#999',
  },
  confirmDialogOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  confirmDialogBox: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    width: '80%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  confirmDialogTitle: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 20,
    color: '#000',
    marginBottom: 15,
    textAlign: 'center',
  },
  confirmDialogMessage: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 16,
    color: '#666',
    marginBottom: 25,
    textAlign: 'center',
    lineHeight: 22,
  },
  confirmDialogButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  confirmDialogButtonCancel: {
    flex: 1,
    backgroundColor: '#e5e5e5',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmDialogButtonCancelText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 16,
    color: '#666',
  },
  confirmDialogButtonConfirm: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmDialogButtonConfirmText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 16,
    color: '#333',
  },
  // Login Screen Styles
  loginContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loginBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  loginLogo: {
    width: 160,
    height: 160,
    marginBottom: 20,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  loginTitle: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 24,
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  loginSubtitle: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  loginInput: {
    width: '100%',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 16,
    color: '#000',
    borderWidth: 2,
    borderColor: '#e5e5e5',
    marginBottom: 10,
  },
  loginInputError: {
    borderColor: '#FF3B30',
  },
  loginError: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 14,
    color: '#FF3B30',
    marginBottom: 15,
    textAlign: 'center',
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonDisabled: {
    backgroundColor: '#ccc',
  },
  loginButtonText: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 16,
    color: '#fff',
  },
  loginHelp: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
  // Empty State Styles
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  messageCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  messageTitle: {
    flex: 1,
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 16,
    color: '#000',
    marginRight: 8,
  },
  messageDate: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 12,
    color: '#666',
  },
  messageSender: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 13,
    color: '#007AFF',
    marginBottom: 6,
  },
  messagePreview: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  messageCc: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic',
  },
  messageCcDetail: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 13,
    color: '#666',
    marginTop: 12,
    fontStyle: 'italic',
  },
  deleteMessageButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  deleteMessageButtonText: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 14,
    color: '#fff',
  },
  deleteReplyButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  deleteReplyButtonText: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 12,
    color: '#fff',
  },
  deleteNotificationIcon: {
    width: 16,
    height: 16,
    tintColor: '#333',
  },
  deleteMessageIcon: {
    width: 16,
    height: 16,
    tintColor: '#333',
  },
  deleteReplyIcon: {
    width: 14,
    height: 14,
    tintColor: '#333',
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
  },
  notificationCardUnread: {
    backgroundColor: '#f0f8ff',
    borderColor: '#007AFF',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  notificationTitle: {
    flex: 1,
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 15,
    color: '#000',
    marginRight: 8,
  },
  notificationMessage: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 14,
    color: '#444',
    marginBottom: 6,
    lineHeight: 20,
  },
  notificationDate: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 12,
    color: '#999',
  },
  notificationUnreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
    position: 'absolute',
    top: 16,
    right: 16,
  },
  deleteNotificationButton: {
    padding: 4,
  },
  deleteNotificationButtonText: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 16,
    color: '#999',
  },
  // Mention Suggestions Styles
  mentionSuggestionsContainer: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    maxHeight: 200,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  mentionSuggestionsList: {
    maxHeight: 200,
  },
  mentionSuggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  mentionAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mentionAvatarText: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 14,
    color: '#fff',
  },
  mentionSuggestionText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 15,
    color: '#000',
  },
  mentionSuggestionEmpty: {
    padding: 20,
    alignItems: 'center',
  },
  mentionSuggestionEmptyText: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 14,
    color: '#999',
  },
  // New Profile Styles
  profilePictureSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  profilePictureLarge: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#e5e5e5',
  },
  changePictureButtonLarge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#007AFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  changePictureIconLarge: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
  profileNameLarge: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 28,
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginBottom: 30,
    alignSelf: 'center',
  },
  signOutButtonText: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 16,
    color: '#fff',
  },
  membersSection: {
    width: '100%',
    marginTop: 20,
  },
  membersSectionTitle: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 20,
    color: '#000',
    marginBottom: 15,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberInitial: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 18,
    color: '#fff',
  },
  memberName: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 16,
    color: '#000',
  },
  // Event Detail Action Buttons
  eventDetailActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  eventDetailActionsVertical: {
    flexDirection: 'column',
    gap: 10,
    marginTop: 10,
  },
  announcementButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  announcementButtonDisabled: {
    opacity: 0.4,
    backgroundColor: '#999',
  },
  announcementButtonText: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 16,
    color: '#fff',
  },
  documentsButton: {
    backgroundColor: '#5856D6',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  documentsButtonText: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 16,
    color: '#fff',
  },
  eventDetailSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  copyTextButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyTextButtonText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 14,
    color: '#333',
  },
  copyTextButtonIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
    tintColor: '#333',
  },
  downloadImageButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  downloadImageButtonText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 14,
    color: '#333',
  },
  eventCardsContainer: {
    paddingRight: 16,
  },
  eventCardHorizontal: {
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginRight: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  eventCardHorizontalImage: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventCardHorizontalPlaceholder: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 14,
    color: '#fff',
  },
  eventCardHorizontalContent: {
    padding: 12,
  },
  eventCardHorizontalName: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 16,
    color: '#000',
    marginBottom: 4,
    minHeight: 40,
  },
  eventCardHorizontalDate: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 13,
    color: '#666',
  },
  uploadingText: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  eventDetailTopSection: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 16,
  },
  eventDetailImageContainer: {
    width: '48%',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  eventDetailImageLarge: {
    width: '100%',
    height: 320,
    borderRadius: 12,
  },
  eventDetailImagePlaceholder: {
    width: '100%',
    height: 320,
    backgroundColor: '#e5e5e5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventImagePlaceholderTextSmall: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 14,
    color: '#999',
  },
  downloadImageButtonSmall: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  downloadImageButtonTextSmall: {
    fontSize: 16,
    color: '#fff',
  },
  downloadImageButtonIconSmall: {
    width: 16,
    height: 16,
    tintColor: '#fff',
  },
  eventDetailInfoContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  eventDetailInfoRow: {
    marginBottom: 12,
  },
  eventDetailInfoLabel: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  eventDetailInfoValue: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 15,
    color: '#000',
  },
  eventEditCompactField: {
    marginBottom: 12,
  },
  compactInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  compactInputText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 14,
    color: '#000',
  },
  compactInputPlaceholder: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 14,
    color: '#999',
  },
  // Toast Notification Styles
  toastContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    zIndex: 9999,
  },
  toastText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 14,
    color: '#fff',
  },
  // Detail Header Styles
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  backButtonIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
    tintColor: '#333',
  },
  backButtonText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 14,
    color: '#333',
  },
  detailHeaderTitle: {
    flex: 1,
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  detailHeaderSpacer: {
    width: 60, // Same width as back button to center the title
  },
  // Checklist Styles
  checklistSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  checklistTitle: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 16,
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  checklistGrid: {
    gap: 12,
  },
  checklistRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  checklistItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  checklistItemPressed: {
    backgroundColor: '#e9ecef',
    borderColor: '#dee2e6',
  },
  checklistCheckbox: {
    marginRight: 8,
  },
  checklistCheckboxText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 16,
    color: '#6c757d',
  },
  checklistItemText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 14,
    color: '#495057',
    flex: 1,
  },
  
  // Team Styles
  teamCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teamCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  teamColorIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  teamCardInfo: {
    flex: 1,
  },
  teamCardName: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  teamCardDescription: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  teamSettingsButton: {
    padding: 8,
  },
  teamSettingsIcon: {
    width: 20,
    height: 20,
    tintColor: '#666',
  },
  teamCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamCardStats: {
    flex: 1,
  },
  teamMemberCount: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  teamLastActivity: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 11,
    color: '#999',
  },
  teamCardBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  teamMemberBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  teamMemberBadgeText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 10,
    color: '#1976D2',
  },
  teamCreatorBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  teamCreatorBadgeText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 10,
    color: '#4CAF50',
  },
  
  // Team Create Styles
  formContainer: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter_18pt-Regular',
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  memberPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  memberPickerButtonText: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 16,
    color: '#333',
  },
  memberPickerIcon: {
    width: 20,
    height: 20,
    tintColor: '#666',
  },
  selectedMembersContainer: {
    marginTop: 8,
  },
  selectedMemberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 6,
    marginBottom: 4,
  },
  selectedMemberName: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 14,
    color: '#333',
  },
  removeMemberButton: {
    padding: 4,
  },
  removeMemberIcon: {
    width: 16,
    height: 16,
    tintColor: '#666',
  },
  
  // Team Styles
  teamMembersList: {
    gap: 8,
  },
  teamMemberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  teamMemberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  teamMemberAvatarText: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 16,
    color: '#fff',
  },
  teamMemberInfo: {
    flex: 1,
  },
  teamMemberName: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  teamMemberRole: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 12,
    color: '#666',
  },
  teamDetailActions: {
    gap: 12,
  },
  teamActionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  teamActionButtonText: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 16,
    color: '#fff',
  },
  teamActionButtonDisabled: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  teamActionButtonTextDisabled: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  teamLeaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 15,
    borderRadius: 10,
  },
  teamLeaveIcon: {
    width: 20,
    height: 20,
    tintColor: '#333',
    marginRight: 8,
  },
  teamLeaveButtonText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 16,
    color: '#333',
  },
  
  // Team Management Styles
  teamManagementContainer: {
    padding: 16,
  },
  teamManagementHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  teamManagementColorIndicator: {
    width: 6,
    height: 60,
    borderRadius: 3,
    marginRight: 16,
  },
  teamManagementInfo: {
    flex: 1,
  },
  teamManagementName: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 20,
    color: '#333',
    marginBottom: 8,
  },
  teamManagementDescription: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  teamManagementSection: {
    marginBottom: 24,
  },
  teamManagementSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamManagementSectionTitle: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 16,
    color: '#333',
  },
  addMemberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addMemberIcon: {
    width: 16,
    height: 16,
    tintColor: '#333',
    marginRight: 6,
  },
  addMemberButtonText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 14,
    color: '#333',
  },
  teamManagementMembersList: {
    gap: 8,
  },
  teamManagementMemberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  teamManagementMemberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  teamManagementMemberAvatarText: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 16,
    color: '#fff',
  },
  teamManagementMemberInfo: {
    flex: 1,
  },
  teamManagementMemberName: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  teamManagementMemberRole: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 12,
    color: '#666',
  },
  removeMemberFromTeamButton: {
    padding: 8,
  },
  removeMemberFromTeamIcon: {
    width: 20,
    height: 20,
    tintColor: '#666',
  },
  teamManagementActions: {
    marginTop: 24,
  },
  deleteTeamButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteTeamButtonText: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 16,
    color: '#fff',
  },
  
  // Team Chat Styles
  teamChatContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  teamChatHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  teamChatHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamChatColorIndicator: {
    width: 4,
    height: 30,
    borderRadius: 2,
    marginRight: 12,
  },
  teamChatInfo: {
    flex: 1,
  },
  teamChatName: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  teamChatMemberCount: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 12,
    color: '#666',
  },
  teamChatMessages: {
    flex: 1,
    paddingHorizontal: 16,
  },
  teamChatMessagesContent: {
    paddingVertical: 16,
  },
  teamMessageContainer: {
    marginBottom: 8,
  },
  teamMessage: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  teamMessageOwn: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
  },
  teamMessageOwnText: {
    color: '#fff',
  },
  teamMessageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  teamMessageSender: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 12,
    color: '#666',
  },
  teamMessageTime: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 10,
    color: '#999',
  },
  teamMessageContent: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  teamMessageActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  teamMessageUpvoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  teamMessageUpvoteIcon: {
    fontSize: 16,
  },
  teamMessageUpvoteCount: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 12,
    color: '#666',
  },
  teamMessageReplyButton: {
    paddingVertical: 4,
  },
  teamMessageReplyText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 12,
    color: '#007AFF',
  },
  teamMessageDeleteButton: {
    padding: 4,
  },
  teamMessageDeleteIcon: {
    width: 16,
    height: 16,
    tintColor: '#666',
  },
  teamMessageReplies: {
    marginTop: 8,
    marginLeft: 16,
    gap: 8,
  },
  teamMessageReply: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 8,
  },
  teamMessageReplyOwn: {
    backgroundColor: '#E3F2FD',
  },
  teamMessageReplyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  teamMessageReplySender: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 10,
    color: '#666',
  },
  teamMessageReplyTime: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 9,
    color: '#999',
  },
  teamMessageReplyContent: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 12,
    color: '#333',
    lineHeight: 16,
    marginBottom: 6,
  },
  teamMessageReplyActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teamMessageReplyUpvoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  teamMessageReplyUpvoteIcon: {
    fontSize: 14,
  },
  teamMessageReplyUpvoteCount: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 10,
    color: '#666',
  },
  teamMessageReplyDeleteButton: {
    padding: 2,
  },
  teamMessageReplyDeleteIcon: {
    width: 14,
    height: 14,
    tintColor: '#666',
  },
  teamReplyInputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  teamReplyInputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamReplyInputHeaderText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 12,
    color: '#666',
  },
  teamReplyInputCancelButton: {
    padding: 4,
  },
  teamReplyInputCancelIcon: {
    width: 16,
    height: 16,
    tintColor: '#666',
  },
  teamReplyInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  teamReplyInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    fontFamily: 'Inter_18pt-Regular',
    backgroundColor: '#fff',
    maxHeight: 80,
  },
  teamReplySendButton: {
    backgroundColor: '#007AFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamReplySendButtonDisabled: {
    backgroundColor: '#f0f0f0',
  },
  teamReplySendIcon: {
    width: 20,
    height: 20,
    tintColor: '#fff',
  },
  teamChatInputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  teamChatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter_18pt-Regular',
    backgroundColor: '#fff',
    maxHeight: 100,
  },
  teamChatSendButton: {
    backgroundColor: '#007AFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamChatSendButtonDisabled: {
    backgroundColor: '#f0f0f0',
  },
  teamChatSendIcon: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
  
  // Modal Styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 18,
    color: '#333',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalCloseIcon: {
    width: 20,
    height: 20,
    tintColor: '#666',
  },
  memberList: {
    maxHeight: 300,
  },
  memberItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  memberItemSelected: {
    backgroundColor: '#E3F2FD',
  },
  memberItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberItemName: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 16,
    color: '#333',
  },
  memberItemCheckmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberItemCheckmarkText: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 12,
    color: '#fff',
  },
});
