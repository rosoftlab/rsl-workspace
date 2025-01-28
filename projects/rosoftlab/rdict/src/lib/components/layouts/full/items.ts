import {
  bellIcon,
  calendarIcon,
  circleIcon,
  envelopeLinkIcon,
  inboxIcon,
  pencilIcon,
  starOutlineIcon,
} from "@progress/kendo-svg-icons";
  
  export const items = [
    {
      text: "Inbox",
      icon: "k-i-inbox",
      svgIcon: inboxIcon,
      selected: true,
      id: 0,
    },
    // {
    //   separator: true,
    //   id: 1,
    // },
    {
      text: "Notifications",
      icon: "k-i-bell",
      svgIcon: bellIcon,
      id: 2,
      parentId: 3,
    },
    {
      text: "Calendar",
      icon: "k-i-calendar",
      svgIcon: calendarIcon,
      id: 3,
    },
    // {
    //   separator: true,
    // },
    {
      text: "Attachments",
      icon: "k-i-envelop-link",
      svgIcon: envelopeLinkIcon,
    },
    {
      text: "Favourites",
      icon: "k-i-star-outline",
      svgIcon: starOutlineIcon,
    },
    {
      text: "Notes",
      icon: "k-i-edit",
      svgIcon: pencilIcon,
      id: 4,
      parentId: 3,
    },
    {
      text: "Archive",
      icon: "k-i-circle",
      svgIcon: circleIcon,
      id: 5,
      parentId: 4,
    },
  ];
  