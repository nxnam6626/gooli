export type TabId = 'import' | 'quality' | 'supply';

export interface CoreValue {
  title: string;
  desc: string;
  iconId: 'trust' | 'quality' | 'care' | 'partner';
}

export interface Leader {
  name: string;
  role: string;
  desc: string;
}

export interface FeaturedProduct {
  title: string;
  desc: string;
  image: string;
}

export const coreValues: CoreValue[] = [
  {
    title: 'UY TÍN',
    desc: 'Cam kết minh bạch về xuất xứ hàng hóa, đầy đủ CO/CQ từ nhà sản xuất. Nói đúng, làm đúng, giao đúng hạn.',
    iconId: 'trust',
  },
  {
    title: 'CHẤT LƯỢNG',
    desc: 'Chỉ hợp tác với nhà sản xuất đạt tiêu chuẩn quốc tế. Mỗi lô hàng đều được kiểm định kỹ trước khi giao đến công trình.',
    iconId: 'quality',
  },
  {
    title: 'TẬN TÂM',
    desc: 'Hỗ trợ tư vấn lựa chọn sản phẩm, bóc tách khối lượng từ bản vẽ và đồng hành cùng khách hàng đến khi hoàn thiện công trình.',
    iconId: 'care',
  },
  {
    title: 'HỢP TÁC',
    desc: 'Xây dựng mối quan hệ dài hạn cùng có lợi với các nhà thầu, kiến trúc sư và đại lý phân phối trên cả nước.',
    iconId: 'partner',
  },
];

export const leaders: Leader[] = [
  {
    name: 'Nguyễn Xuân Nam',
    role: 'Giám đốc',
    desc: 'Nhà sáng lập GOOLI với nhiều năm kinh nghiệm trong lĩnh vực vật liệu xây dựng. Trực tiếp xây dựng hệ thống nhập khẩu và phân phối vật tư nhôm cao cấp, hướng tới mục tiêu cung cấp giải pháp vật liệu đồng bộ và minh bạch cho thị trường xây dựng Việt Nam.',
  },
];

export const featuredProducts: FeaturedProduct[] = [
  {
    title: 'Trần nhôm hộp & lam sóng',
    desc: 'Hệ trần nhôm hộp và lam sóng ứng dụng cho văn phòng, trung tâm thương mại và không gian công cộng.',
    image: '/projects/project_vna_sanh.png',
  },
  {
    title: 'Trần Caro Cell nghệ thuật',
    desc: 'Trần Caro Cell kết hợp đèn LED âm trần, tạo hiệu ứng thị giác độc đáo cho không gian nội thất cao cấp.',
    image: '/projects/project_caro_cell_bg.png',
  },
  {
    title: 'Tấm ốp & lam ngoài trời',
    desc: 'Tấm ốp mặt dựng và hệ lam che nắng ngoài trời chịu thời tiết, phủ sơn tĩnh điện bền màu lâu dài.',
    image: '/projects/project_sunshade_ams.png',
  },
];
