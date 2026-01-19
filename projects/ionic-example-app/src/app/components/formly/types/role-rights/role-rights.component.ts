import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { FormlyKendoModule } from '@ngx-formly/kendo';
import { TranslateService } from '@ngx-translate/core';
import { KENDO_BUTTONS } from '@progress/kendo-angular-buttons';
import { KENDO_DIALOG } from '@progress/kendo-angular-dialog';
import { KENDO_INPUTS } from '@progress/kendo-angular-inputs';
import { KENDO_LABEL, KENDO_LABELS } from '@progress/kendo-angular-label';
import { KENDO_TOOLBAR } from '@progress/kendo-angular-toolbar';
import { CheckableSettings, KENDO_TREEVIEW } from '@progress/kendo-angular-treeview';
import { arrowLeftIcon, saveIcon, SVGIcon } from '@progress/kendo-svg-icons';
import { Right, RightService, RoleService } from '@rosoftlab/core';
import { map, Observable, of, startWith, Subject, takeUntil, tap } from 'rxjs';

export type RightTreeNode = Right & { items?: RightTreeNode[] };

@Component({
  selector: 'app-role-rights',
  templateUrl: './role-rights.component.html',
  styleUrls: ['./role-rights.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FormlyKendoModule,
    KENDO_TREEVIEW,
    KENDO_TOOLBAR,
    KENDO_LABEL,
    KENDO_BUTTONS,
    KENDO_DIALOG,
    KENDO_INPUTS,
    KENDO_LABELS
  ]
})
export class RoleRightsComponent extends FieldType<FieldTypeConfig> implements OnInit, OnDestroy {
  public nodes: RightTreeNode[] = [];
  private destroy$ = new Subject<void>();

  public checkedKeys: string[] = [];
  public nodes$!: Observable<RightTreeNode[]>;
  private checkedIdSet = new Set<string>();

  public saveIcon: SVGIcon = saveIcon;
  public backIcon: SVGIcon = arrowLeftIcon;
  checkParents = true;
  checkChildren = true;
  constructor(
    private roleService: RoleService,
    private rightService: RightService,
    protected translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }
  public get checkableSettings(): CheckableSettings {
    return {
      checkChildren: this.checkChildren,
      checkParents: this.checkParents,
      enabled: true,
      mode: 'multiple'
    };
  }
  ngOnInit() {
    const roleId = this.model?.id;
    this.rightService
      .getAll(1, 1000)
      .pipe(
        map((r) => this.buildRightsTree(r.getModels())),
        tap((builtNodes) => {
          this.nodes = builtNodes;
          this.updateCheckedKeys(this.checkedIdSet);
        
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
    this.formControl.valueChanges.pipe(startWith(this.formControl.value), takeUntil(this.destroy$)).subscribe((roleDetails: any[]) => {
      const ids = (roleDetails || []).map((d) => d.rightId);
      this.checkedIdSet = new Set(ids);
      // this.checkedKeys = ids;
      // this.updateCheckedKeys(this.checkedIdSet);
    });
  }
  private updateCheckedKeys(roleDetails: Set<any>) {
    if (!this.nodes || !roleDetails) return;
    this.checkChildren = false;
    this.checkParents = false;
    // Fill the property with "0", "1_0" style strings
    this.checkedKeys = this.findKeysByIds(this.nodes, roleDetails);
    this.cdr.markForCheck();
    this.cdr.detectChanges();
    this.checkChildren = true;
    this.checkParents = true;
  }

  private findKeysByIds(nodes: RightTreeNode[], targetIds: Set<string>, parentIndex = ''): string[] {
    let keys: string[] = [];

    nodes.forEach((node, i) => {
      const currentIndex = parentIndex === '' ? `${i}` : `${parentIndex}_${i}`;

      if (targetIds.has(node.id)) {
        keys.push(currentIndex);
      }

      if (node.items && node.items.length > 0) {
        keys = [...keys, ...this.findKeysByIds(node.items, targetIds, currentIndex)];
      }
    });

    return keys;
  }

  public handleTreeChange(indices: string[]): void {
    const roleId = this.model?.id;
    // 1. Map all handles to their respective nodes
    // We use flatMap with findNodePathByHandle to be extra safe about the lineage,
    // though findNodeByHandle is usually enough since Kendo provides all keys.
    // 1. Resolve every handle to its full path of objects
    // If indices are ['0', '0_1'], findNodePathByHandle('0_1') returns [Parent, Child]
    const allNodesInPath = indices.flatMap((handle) => this.findNodePathByHandle(handle));

    // 2. Remove duplicates (since different handles share parents) and map to roleDetail
    const uniqueNodes = Array.from(new Map(allNodesInPath.map((node) => [node.id, node])).values());

    const updatedDetails = uniqueNodes.map((node) => ({
      roleId: roleId,
      rightId: node.id
      // You can also add node.name or other fields here if your backend needs them
    }));
    console.log(updatedDetails);
    // 3. Update the Reactive Form control
    this.formControl.setValue(updatedDetails);
    this.formControl.markAsDirty();
  }
  private findNodeByHandle(handle: string): RightTreeNode | null {
    if (!handle || !this.nodes) return null;

    const path = handle.split('_').map(Number);
    let currentLevel: RightTreeNode[] = this.nodes;
    let targetNode: RightTreeNode | null = null;

    for (const index of path) {
      if (!currentLevel || !currentLevel[index]) return null;
      targetNode = currentLevel[index];
      currentLevel = targetNode.items || [];
    }

    return targetNode;
  }
  // Helper to get a node by index like "1_0"
  private findNodePathByHandle(handle: string): Right[] {
    if (!handle || !this.nodes) return [];

    const path = handle.split('_').map(Number);
    let currentLevel: RightTreeNode[] = this.nodes;
    const nodesInPath: Right[] = [];

    for (const index of path) {
      const targetNode = currentLevel[index];
      if (targetNode) {
        nodesInPath.push(targetNode); // Add each parent and finally the child
        currentLevel = targetNode.items || [];
      }
    }

    return nodesInPath; // Returns [Parent, SubParent, Leaf]
  }

  public hasChildren = (item: RightTreeNode): boolean => {
    return Array.isArray(item.items) && item.items.length > 0;
  };

  public fetchChildren = (node: RightTreeNode): Observable<RightTreeNode[]> => {
    return of(node.items ?? []);
  };
  private buildRightsTree(flat: Right[]): RightTreeNode[] {
    const nodes = (flat ?? []) as RightTreeNode[];

    // Ensure a clean items[] every time (avoid duplicates if rebuild)
    for (const n of nodes) {
      n.items = [];
    }

    const byId = new Map<string, RightTreeNode>();
    for (const n of nodes) {
      // IMPORTANT: use the accessor/property, not _id
      byId.set(String(n.id), n);
    }

    const roots: RightTreeNode[] = [];

    for (const n of nodes) {
      n.translated_name = this.translate.instant(n.resourceName ?? n.name ?? '');
      const parentId = n.parentId;

      const hasParent = parentId !== undefined && parentId !== null && parentId !== '' && byId.has(String(parentId));

      if (hasParent) {
        byId.get(String(parentId))!.items!.push(n);
      } else {
        roots.push(n);
      }
    }

    const sortRecursive = (arr: RightTreeNode[]) => {
      arr.sort((a, b) => {
        const ao = a.order ?? 0;
        const bo = b.order ?? 0;
        if (ao !== bo) return ao - bo;
        return String(a.name ?? '').localeCompare(String(b.name ?? ''));
      });

      for (const n of arr) {
        if (n.items?.length) sortRecursive(n.items);
      }
    };

    sortRecursive(roots);
    return roots;
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
