import {
    TagIcon,
    HomeIcon,
    Bars3CenterLeftIcon,
    MapPinIcon,
    Squares2X2Icon,
    BriefcaseIcon,
    ArrowsPointingOutIcon
} from '@heroicons/react/24/outline';

export const FilterIcons = {
    price: <TagIcon className="w-4 h-4 text-gray-500" />,
    propertyType: <HomeIcon className="w-4 h-4 text-gray-500" />,
    transit: <MapPinIcon className="w-4 h-4 text-gray-500" />,
    listingType: <TagIcon className="w-4 h-4 text-gray-500" />,
    bedrooms: <Bars3CenterLeftIcon className="w-4 h-4 text-gray-500" />,
    bathrooms: <Bars3CenterLeftIcon className="w-4 h-4 text-gray-500" />,
    projectStatus: <Squares2X2Icon className="w-4 h-4 text-gray-500" />,
    developer: <BriefcaseIcon className="w-4 h-4 text-gray-500" />,
    project: <HomeIcon className="w-4 h-4 text-gray-500" />,
    size: <ArrowsPointingOutIcon className="w-4 h-4 text-gray-500" />
};
