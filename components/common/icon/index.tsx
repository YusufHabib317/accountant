// import { toCapitalize } from '@/utils';
// import
// * as TablerIcons
//   from '@tabler/icons-react';

// export default function Icon({ icon, size }: { icon: string, size:number|string }) {
//   const keys: string[] = Object.keys(TablerIcons);
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   let Item:any = TablerIcons.IconApps;
//   const dashedIcon = icon && icon.split('-');
//   let item = '';
//   if (dashedIcon && dashedIcon.length >= 1) {
//     dashedIcon.map((i: string) => {
//       item += `${toCapitalize(i)}`;
//       return item;
//     });
//     item = `Icon${item}`;
//     keys.forEach((key) => {
//       if (key === item || key === icon) {
//         Item = TablerIcons[key as keyof typeof TablerIcons];
//       }
//     });
//   }

//   return <Item stroke={1.5} size={size} />;
// }
