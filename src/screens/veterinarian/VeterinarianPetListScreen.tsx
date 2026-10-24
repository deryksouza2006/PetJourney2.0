import Ionicons from '@expo/vector-icons/Ionicons';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../components/AppButton';
import { PaginationControls } from '../../components/PaginationControls';
import { VeterinarianPatientRow } from '../../components/veterinarian/VeterinarianPatientRow';
import { useTheme } from '../../contexts/ThemeContext';
import { usePets } from '../../hooks/pets/usePets';
import { useSmartCareRanking } from '../../hooks/smartCare/useSmartCareRanking';
import {
    VeterinarianStackParamList,
    VeterinarianTabParamList,
} from '../../navigation/VeterinarianNavigator';
import { radii, spacing, ThemeColors, typography } from '../../theme/tokens';
import { DEFAULT_PAGE_SIZE } from '../../types/pagination';
import { Pet, PetSpecies } from '../../types/pet';
import { SmartCarePriority } from '../../types/smartCare';

type Props = CompositeScreenProps<
    BottomTabScreenProps<VeterinarianTabParamList, 'Patients'>,
    NativeStackScreenProps<VeterinarianStackParamList>
>;

type PatientFilter = 'ALL' | 'DOGS' | 'CATS' | 'FOLLOW_UP';
type PatientSmartCarePriority = SmartCarePriority | 'SEM_DADOS';

const FILTERS: Array<{ value: PatientFilter; label: string }> = [
    { value: 'ALL', label: 'Todos' },
    { value: 'DOGS', label: 'Cães' },
    { value: 'CATS', label: 'Gatos' },
    { value: 'FOLLOW_UP', label: 'Acompanhamento' },
];

const SPECIES_LABELS: Record<PetSpecies, string> = {
    CACHORRO: 'Cachorro',
    GATO: 'Gato',
    AVE: 'Ave',
    ROEDOR: 'Roedor',
    REPTIL: 'Réptil',
    OUTRO: 'Outro',
};

function normalizeSearchValue(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('pt-BR')
        .trim();
}

function formatAge(birthDate: string | null): string | null {
    if (!birthDate) {
        return null;
    }

    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(birthDate);

    if (!match) {
        return null;
    }

    const birthYear = Number(match[1]);
    const birthMonth = Number(match[2]);
    const birthDay = Number(match[3]);
    const today = new Date();
    let age = today.getFullYear() - birthYear;
    const hasNotHadBirthday = today.getMonth() + 1 < birthMonth
        || (today.getMonth() + 1 === birthMonth && today.getDate() < birthDay);

    if (hasNotHadBirthday) {
        age -= 1;
    }

    if (age < 0) {
        return null;
    }

    if (age === 0) {
        return 'menos de 1 ano';
    }

    return `${age} ${age === 1 ? 'ano' : 'anos'}`;
}

function getSecondaryInformation(pet: Pet): string {
    const information = [
        SPECIES_LABELS[pet.species],
        pet.breed?.trim() || null,
        formatAge(pet.birthDate),
        pet.tutorName?.trim() || null,
    ].filter((value): value is string => Boolean(value));

    return information.join(' • ');
}

function matchesSearch(pet: Pet, normalizedQuery: string): boolean {
    if (!normalizedQuery) {
        return true;
    }

    const searchableValues = [
        pet.name,
        pet.species,
        SPECIES_LABELS[pet.species],
        pet.breed,
        pet.tutorName,
    ];

    return searchableValues.some((value) =>
        value ? normalizeSearchValue(value).includes(normalizedQuery) : false,
    );
}

function getEmptyMessage(
    totalElements: number,
    search: string,
    filter: PatientFilter,
): string {
    if (totalElements === 0) {
        return 'Nenhum paciente disponível.';
    }

    if (search.trim()) {
        return 'Nenhum paciente encontrado.';
    }

    if (filter !== 'ALL') {
        return 'Nenhum paciente nesta categoria.';
    }

    return 'Nenhum paciente disponível.';
}

export function VeterinarianPetListScreen({ navigation }: Props) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState<PatientFilter>('ALL');
    const pets = usePets(page, DEFAULT_PAGE_SIZE);
    const smartCare = useSmartCareRanking();
    const smartCarePriorityByPet = useMemo(() => {
        const priorities = new Map<number, PatientSmartCarePriority>();

        smartCare.data?.analises.forEach((analysis) => {
            priorities.set(analysis.petId, analysis.prioridade);
        });
        smartCare.data?.semDadosSuficientes.forEach((pet) => {
            priorities.set(pet.petId, 'SEM_DADOS');
        });

        return priorities;
    }, [smartCare.data]);
    const normalizedQuery = normalizeSearchValue(search);
    const filteredPets = useMemo(() => {
        const currentPagePets = pets.data?.content ?? [];

        return currentPagePets.filter((pet) => {
            if (!matchesSearch(pet, normalizedQuery)) {
                return false;
            }

            if (activeFilter === 'DOGS') {
                return pet.species === 'CACHORRO';
            }

            if (activeFilter === 'CATS') {
                return pet.species === 'GATO';
            }

            if (activeFilter === 'FOLLOW_UP') {
                const priority = smartCarePriorityByPet.get(pet.id);
                return priority === 'ALTA' || priority === 'MEDIA';
            }

            return true;
        });
    }, [activeFilter, normalizedQuery, pets.data?.content, smartCarePriorityByPet]);

    function updateSearch(value: string): void {
        setSearch(value);

        if (page !== 0) {
            setPage(0);
        }
    }

    function updateFilter(filter: PatientFilter): void {
        setActiveFilter(filter);

        if (page !== 0) {
            setPage(0);
        }
    }

    function renderPatient({ item }: { item: Pet }) {
        return (
            <VeterinarianPatientRow
                name={item.name}
                secondaryInformation={getSecondaryInformation(item)}
                smartCarePriority={smartCarePriorityByPet.get(item.id)}
                onPress={() => navigation.navigate('PetDetails', { petId: item.id })}
            />
        );
    }

    const followUpUnavailable = !smartCare.data;

    return (
        <SafeAreaView style={styles.safeArea} edges={['right', 'bottom', 'left']}>
            <View style={styles.container}>
                <View style={styles.controls}>
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color={colors.textSecondary} />
                        <TextInput
                            accessibilityLabel="Buscar paciente, espécie, raça ou tutor"
                            value={search}
                            onChangeText={updateSearch}
                            placeholder="Buscar paciente, espécie, raça ou tutor"
                            placeholderTextColor={colors.textSecondary}
                            returnKeyType="search"
                            autoCorrect={false}
                            style={styles.searchInput}
                        />
                        {search ? (
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="Limpar busca"
                                hitSlop={8}
                                onPress={() => updateSearch('')}
                                style={({ pressed }) => pressed && styles.pressed}
                            >
                                <Ionicons
                                    name="close-circle"
                                    size={21}
                                    color={colors.textSecondary}
                                />
                            </Pressable>
                        ) : null}
                    </View>

                    <ScrollView
                        horizontal
                        nestedScrollEnabled
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterContent}
                        style={styles.filterScroll}
                    >
                        {FILTERS.map((filter) => {
                            const isActive = activeFilter === filter.value;
                            const isDisabled = filter.value === 'FOLLOW_UP' && followUpUnavailable;

                            return (
                                <Pressable
                                    key={filter.value}
                                    accessibilityRole="button"
                                    accessibilityState={{ selected: isActive, disabled: isDisabled }}
                                    disabled={isDisabled}
                                    onPress={() => updateFilter(filter.value)}
                                    style={({ pressed }) => [
                                        styles.filterChip,
                                        isActive && styles.activeFilterChip,
                                        isDisabled && styles.disabledFilterChip,
                                        pressed && styles.pressed,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.filterLabel,
                                            isActive && styles.activeFilterLabel,
                                        ]}
                                    >
                                        {filter.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </ScrollView>

                    <View style={styles.listHeading}>
                        <View>
                            <Text style={styles.listTitle}>Pacientes</Text>
                            {pets.data ? (
                                <Text style={styles.resultCount}>
                                    {filteredPets.length === 1
                                        ? '1 resultado nesta página'
                                        : `${filteredPets.length} resultados nesta página`}
                                </Text>
                            ) : null}
                        </View>
                        {pets.isFetching && !pets.isPending ? (
                            <ActivityIndicator size="small" color={colors.primary} />
                        ) : null}
                    </View>
                </View>

                {pets.isPending ? (
                    <View style={styles.loadingState}>
                        <ActivityIndicator size="small" color={colors.primary} />
                        <Text style={styles.stateMessage}>Carregando pacientes...</Text>
                    </View>
                ) : pets.isError ? (
                    <View style={styles.stateCard}>
                        <Ionicons name="cloud-offline-outline" size={28} color={colors.danger} />
                        <Text style={styles.stateTitle}>Não foi possível carregar</Text>
                        <Text style={styles.stateMessage}>
                            Não foi possível carregar os pacientes.
                        </Text>
                        <AppButton
                            label="Tentar novamente"
                            onPress={() => void pets.refetch()}
                            variant="secondary"
                            size="small"
                            loading={pets.isFetching}
                            style={styles.retryButton}
                        />
                    </View>
                ) : (
                    <FlatList
                        style={styles.listSurface}
                        data={filteredPets}
                        keyExtractor={(pet) => pet.id.toString()}
                        renderItem={renderPatient}
                        ItemSeparatorComponent={() => <View style={styles.divider} />}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="on-drag"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={filteredPets.length === 0
                            ? styles.emptyListContent
                            : styles.listContent}
                        refreshControl={(
                            <RefreshControl
                                refreshing={pets.isRefetching}
                                onRefresh={() => void pets.refetch()}
                                colors={[colors.primary]}
                                progressBackgroundColor={colors.surface}
                                tintColor={colors.primary}
                            />
                        )}
                        ListEmptyComponent={(
                            <View style={styles.emptyState}>
                                <Ionicons
                                    name="paw-outline"
                                    size={30}
                                    color={colors.textSecondary}
                                />
                                <Text style={styles.stateMessage}>
                                    {getEmptyMessage(
                                        pets.data.totalElements,
                                        search,
                                        activeFilter,
                                    )}
                                </Text>
                            </View>
                        )}
                        ListFooterComponent={(
                            <PaginationControls
                                page={pets.data.number}
                                totalPages={pets.data.totalPages}
                                isFirst={pets.data.first}
                                isLast={pets.data.last}
                                disabled={pets.isFetching}
                                onPrevious={() => setPage(pets.data.number - 1)}
                                onNext={() => setPage(pets.data.number + 1)}
                            />
                        )}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

function createStyles(colors: ThemeColors) {
    return StyleSheet.create({
        safeArea: { flex: 1, backgroundColor: colors.background },
        container: {
            flex: 1,
            width: '100%',
            maxWidth: 760,
            alignSelf: 'center',
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.lg,
            backgroundColor: colors.background,
        },
        controls: { width: '100%' },
        searchContainer: {
            minHeight: 50,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            paddingHorizontal: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.md,
            backgroundColor: colors.inputBackground,
        },
        searchInput: {
            flex: 1,
            minWidth: 0,
            paddingVertical: spacing.md,
            color: colors.text,
            fontSize: typography.caption,
        },
        filterScroll: { marginHorizontal: -spacing.lg, marginTop: spacing.lg },
        filterContent: { gap: spacing.sm, paddingHorizontal: spacing.lg },
        filterChip: {
            minHeight: 40,
            justifyContent: 'center',
            paddingHorizontal: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.pill,
            backgroundColor: colors.surface,
        },
        activeFilterChip: {
            borderColor: colors.primary,
            backgroundColor: colors.primarySoft,
        },
        disabledFilterChip: { opacity: 0.48 },
        filterLabel: {
            color: colors.textSecondary,
            fontSize: typography.caption,
            fontWeight: '700',
        },
        activeFilterLabel: { color: colors.primary, fontWeight: '800' },
        pressed: { opacity: 0.7 },
        listHeading: {
            minHeight: 68,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: spacing.md,
            paddingTop: spacing.lg,
            paddingBottom: spacing.md,
        },
        listTitle: { color: colors.text, fontSize: typography.heading, fontWeight: '800' },
        resultCount: {
            marginTop: spacing.xs,
            color: colors.textSecondary,
            fontSize: typography.small,
        },
        listSurface: {
            flex: 1,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.surface,
        },
        listContent: { paddingBottom: spacing.sm },
        emptyListContent: { flexGrow: 1 },
        divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
        loadingState: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.md,
        },
        stateCard: {
            alignItems: 'center',
            gap: spacing.sm,
            padding: spacing.xl,
            borderWidth: 1,
            borderColor: colors.errorBorder,
            borderRadius: radii.lg,
            backgroundColor: colors.errorSurface,
        },
        stateTitle: {
            color: colors.text,
            fontSize: typography.body,
            fontWeight: '800',
            textAlign: 'center',
        },
        stateMessage: {
            color: colors.textSecondary,
            fontSize: typography.caption,
            lineHeight: 20,
            textAlign: 'center',
        },
        retryButton: { marginTop: spacing.sm },
        emptyState: {
            flex: 1,
            minHeight: 180,
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sm,
            padding: spacing.xl,
        },
    });
}
